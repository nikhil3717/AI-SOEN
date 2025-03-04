import React from 'react'
import {Route, BrowserRouter, Routes }  from 
'react-router-dom'
import Login from '../src/Login'
import Register from '../src/Register'
import Home from '../src/Home'
import Project from '../src/Project'
import UserAuth from '../src/auth/UserAuth'

const AppRoutes = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <UserAuth> 
            <Home/>
            </UserAuth>
          } />
          <Route path="/login" element={<Login/>}  />
          <Route path="/register" element={ <Register/> } />
          <Route path="/project" element={ <UserAuth>
          <Project/>
          </UserAuth>
            } />

        </Routes>
      </BrowserRouter>
  )
}

export default AppRoutes