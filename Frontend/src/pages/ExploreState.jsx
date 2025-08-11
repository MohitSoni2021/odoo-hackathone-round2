import React from 'react'
import { useParams } from 'react-router-dom';

const ExploreState = () => {
    const { state } = useParams();
  return (
    <div>
      {state}
    </div>
  )
}

export default ExploreState
