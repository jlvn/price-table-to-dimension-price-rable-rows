/** @type {{ parse: function(string): {data: *[]}, unparse: function(*[]): string }} */
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'

const input = document.getElementById('input')
const button = document.getElementById('button')
const productId = document.getElementById('productId')

/**
 * @typedef {{ configurableProduct: string, title: string, height: number, width: number, price: number }} DimensionPriceTableRow
 */

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
            const width = row[0]
            const height = header[j]
            const price = Math.floor(parseFloat(row[j].replace('€ ', '').replace(',', '.')) * 100)

            rows.push({ title: `${name}-${height}-${width}`, configurableProduct: productId, height, width, price })
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

    const name = file.name.split('.').shift()
    const id = productId.value
    const data = await file.text()

    const rows = priceTableToDimensionPriceRows(id, name, data)

    const csv = Papa.unparse(rows)

    download(`${id}-${name}-rows.csv`, 'text/csv', csv)
})