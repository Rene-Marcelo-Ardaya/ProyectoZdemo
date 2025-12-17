import { useMemo, useState } from 'react'

// Store sencillo para datasets: filtro, sort, seleccionar
export function useStore(initialData = []) {
  const [data, setData] = useState(initialData)
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const filtered = useMemo(() => {
    let res = data
    if (filter) {
      res = res.filter((row) => JSON.stringify(row).toLowerCase().includes(filter.toLowerCase()))
    }
    if (sort.key) {
      const dir = sort.dir === 'desc' ? -1 : 1
      res = [...res].sort((a, b) => {
        if (a[sort.key] > b[sort.key]) return dir
        if (a[sort.key] < b[sort.key]) return -dir
        return 0
      })
    }
    return res
  }, [data, filter, sort])

  return {
    data: filtered,
    raw: data,
    setData,
    setFilter,
    setSort,
  }
}
