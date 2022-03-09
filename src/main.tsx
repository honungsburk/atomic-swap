import React from "react";
import ReactDOM from "react-dom";
import "./main.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { ColorModeScript } from "@chakra-ui/react";
import Theme from "./Theme";
import { registerSW } from "virtual:pwa-register";

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={Theme.config.initialColorMode} />
    <BrowserRouter>
      <React.StrictMode>
        <ChakraProvider theme={Theme}>
          <App />
        </ChakraProvider>
      </React.StrictMode>
    </BrowserRouter>
  </>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line prefer-const
let updateSW = registerSW();
