import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { Provider } from "react-redux"
import { store } from "./store/store"

const wallets = [new PetraWallet()]
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
        <App />
      </AptosWalletAdapterProvider>
    </Provider>
  </React.StrictMode>,
)
