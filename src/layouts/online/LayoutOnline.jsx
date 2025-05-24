import React from 'react'
import { Outlet } from 'react-router-dom'
import UnifiedMainNav from '../../components/common/UnifiedMainNav'


const LayoutOnline = () => {
    return (
        <div>
            <UnifiedMainNav />
            <hr />
            <main className='h-full px-4 mt-2 mx-auto'>

            <Outlet />   
            </main>
            
        </div>
    )
}

export default LayoutOnline