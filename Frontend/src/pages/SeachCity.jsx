import React from 'react'
import { useParams } from 'react-router-dom'
import WikipediaSearch from '../components/common/DetailedSearch';

const SeachCity = () => {
  const { state } = useParams();
  return (
    <WikipediaSearch />
  )
}

export default SeachCity