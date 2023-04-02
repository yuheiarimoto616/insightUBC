import React from 'react'
import { Stack } from "@mui/material";
import Feed from "./Feed";
import Sidebar from "./Sidebar";
import Navbar from './Navbar';


const MainPage = () => {
  return (
    <div className='MainPage'>
        <Navbar/>
        <Stack direction={"row"} spacing={1} justifyContent="space-between">
            <Sidebar/>
            <Feed/>
        </Stack>
    </div>
    
  )
}

export default MainPage