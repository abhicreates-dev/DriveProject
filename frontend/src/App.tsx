import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APITester } from "./APITester";
import "./index.css";
import { Button } from "./components/ui/button";
import {BrowserRouter, Routes, Route} from "react-router"

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { useState } from "react";

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
          <Route path="/" element={<APITester />} />
        </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
