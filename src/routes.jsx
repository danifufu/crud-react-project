import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginForm } from "./components/Login/LoginForm";
import { List } from "./components/List/List";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm/>}/>
        <Route path="/list" element={<List/>}/>
      </Routes>
    </BrowserRouter>
  
  )
}