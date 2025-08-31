import React, { forwardRef, useImperativeHandle, useState } from "react";
import "@app/theme-steampunk.css";
import airship from "../assets/airship.gif";

const AirshipFlyby = forwardRef(function AirshipFlyby(_, ref){
  const [fly, setFly] = useState(false);
  const [message, setMessage] = useState("");

  useImperativeHandle(ref, () => ({
    launch(msg = "Added to Cabinet") {
      setMessage(msg);
      setFly(false);
      requestAnimationFrame(() => setFly(true));
      setTimeout(() => setFly(false), 3300);
    }
  }));

  return (
    <>
      <img className={`airship ${fly ? "fly" : "hide"}`} src={airship} alt="" />
      <div className={`airship-banner ${fly ? "fly" : "hide"}`}>{message}</div>
    </>
  );
});

export default AirshipFlyby;
