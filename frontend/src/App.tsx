import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APITester } from "./APITester";
import "./index.css";
import { Button } from "./components/ui/button";
import {BrowserRouter, Routes, Route} from "react-router"

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { useState } from "react";
import { Home } from "./pages/home";
import { SignIn } from "./pages/signin";
import { SignUp } from "./pages/signup";

export function App() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [click, setClick] = useState({
    email: "",
    password: ""
  })

  function handleChange(){

  }

  function handleClick(){
    click.email

  }

  return (
    <div>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
