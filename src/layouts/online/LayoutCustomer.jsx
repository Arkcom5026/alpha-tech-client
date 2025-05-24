
import React from 'react'
import { Outlet } from 'react-router-dom'


const LayoutCustomer = () => {
    return (
        <div>
            <UnifiedMainNav />
            <hr />
            <main  className='h-full px-4 mt-2 mx-auto'>

            <Outlet />   
            </main>
            
        </div>
    )
}

export default LayoutCustomer