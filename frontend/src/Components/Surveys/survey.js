import React from "react";
import FormCards from "../HomePage/Cardform/card";
import "../HomePage/Cardform/card.css"
import { Navbar,Footer } from "../HomePage/navbar";

function Survey (){
    return(
   <>
    <Navbar/>
    <FormCards/>
    <Footer/>
   </>
    )
}
export default Survey;