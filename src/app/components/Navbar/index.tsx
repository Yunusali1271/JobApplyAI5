import React from 'react'
import Desktop from './Desktop'
import Mobile from './Mobile'

const index = () => {
  return (
    <>
    <div className='w-full hidden lg:block'><Desktop/></div>  
    <div className='w-full block lg:hidden'><Mobile/></div></>  
  )
}

export default index