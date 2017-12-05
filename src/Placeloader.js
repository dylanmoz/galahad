// @flow

import React from 'react'

type Props = {
  w: string | number
}

export default function Placeloader({ w, style, ...others }: Props) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: w, ...style }} {...others}>
        <div style={{ padding: '4.5px 0' }}>
          <div className="placeloader" />
        </div>
      </div>
    </div>
  )
}
