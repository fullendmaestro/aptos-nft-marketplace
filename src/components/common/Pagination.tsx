// src\components\common\Pagination.tsx
import React from "react"
import { Pagination as AntPagination } from "antd"

interface PaginationProps {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
}) => {
  return (
    <div className="mt-8 mb-8">
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger={false}
        className="flex justify-center"
      />
    </div>
  )
}

export default Pagination
