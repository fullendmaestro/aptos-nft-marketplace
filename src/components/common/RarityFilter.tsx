// src\components\common\RarityFilter.tsx
import React from "react"
import { Radio } from "antd"

interface RarityFilterProps {
  rarity: "all" | number
  onChange: (rarity: "all" | number) => void
}

const RarityFilter: React.FC<RarityFilterProps> = ({ rarity, onChange }) => (
  <Radio.Group
    value={rarity}
    onChange={e => onChange(e.target.value)}
    buttonStyle="solid"
  >
    <Radio.Button value="all">All</Radio.Button>
    <Radio.Button value={1}>Common</Radio.Button>
    <Radio.Button value={2}>Uncommon</Radio.Button>
    <Radio.Button value={3}>Rare</Radio.Button>
    <Radio.Button value={4}>Super Rare</Radio.Button>
  </Radio.Group>
)

export default RarityFilter
