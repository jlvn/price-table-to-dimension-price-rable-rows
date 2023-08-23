/** @type {{ parse: function(string): {data: *[]}, unparse: function(*[]): string }} */
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'

const input = document.getElementById('input')
const button = document.getElementById('button')

/**
 * @typedef {{ configurableProduct: string, title: string, height: number, width: number, price: number }} DimensionPriceTableRow
 */

/**
 * @param {number} price
 */
const priceToPriceInCents = (price) => Math.floor(price * 100)

/**
 * @param {string} filename
 * @throws Error
 * @return {Promise<{id: string, name: string}>}
 */
const tryGetIdAndNameFromFilename = async (filename) => {
    const filenameParts = filename.split('.')
    if (filenameParts.length !== 3) {
        throw new Error('invalid file name. file name should be of format `<productId>.<name>.csv` ')
    }
    const [id, name] = filenameParts
    return {
        id,
        name
    }
}

/**
 * @param {string} name
 * @param {string} data
 * @param {string} type
 */
const download = (name, type, data) => {
    const blob = new Blob([data], {
        type
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click();
    window.URL.revokeObjectURL(url)
}

/**
 * @param {string} productId
 * @param {string} name
 * @param {string} content
 * @return {DimensionPriceTableRow[]}
 */
const priceTableToDimensionPriceRows = (productId, name, content) => {
    const {data} = Papa.parse(content)

    /** @type {DimensionPriceTableRow[]}*/
    const rows = []
    if (data.length === 0) {
        return rows
    }

    for (let i = 1; i < data.length; i++) {
        const header = data[0]
        const row = data[i]
        for (let j = 1; j < row.length; j++) {
            const headerColumn = header[j]
            const column = row[j]
            const width = parseInt(row[0])
            const height = parseInt(headerColumn)
            const price = parseFloat(column.replace('€ ', '').replace(',', '.'))

            if (isNaN(width) || isNaN(height) || isNaN(price)) {
                continue
            }

            rows.push({
                title: `${name}-${height}-${width}`,
                configurableProduct: productId,
                height,
                width,
                price: priceToPriceInCents(price)
            })
        }
    }

    return rows
}

button.addEventListener('click', async () => {
    if (input.files.length === 0) {
        return
    }

    /** @type {File} */
    const file = input.files[0]

    try {
        const {
            id,
            name
        } = await tryGetIdAndNameFromFilename(file.name)

        const data = await file.text()

        const rows = priceTableToDimensionPriceRows(id, name, data)

        const csv = Papa.unparse(rows)

        download(`${id}-${name}-rows.csv`, 'text/csv', csv)
    } catch (e) {
        console.error(e)
    }
})