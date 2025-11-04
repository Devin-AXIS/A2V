"use client"

import { useState } from "react"
import { X, Wallet } from "lucide-react"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (address: string, walletType: string) => void
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const wallets = [
    {
      name: "MetaMask",
      logo: "/metamask-fox-logo-orange.jpg",
      id: "metamask",
      description: "Most popular Ethereum wallet",
      color: "#F6851B",
    },
    {
      name: "OKX Wallet",
      logo: "/okx-wallet-logo-black.jpg",
      id: "okx",
      description: "Multi-chain crypto wallet",
      color: "#000000",
    },
    {
      name: "WalletConnect",
      logo: "/walletconnect-logo-blue.png",
      id: "walletconnect",
      description: "Connect any mobile wallet",
      color: "#3B99FC",
    },
  ]

  const connectWallet = async (walletId: string) => {
    setIsConnecting(true)
    setError("")

    try {
      let provider: any = null

      if (walletId === "metamask") {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          provider = (window as any).ethereum
        } else {
          setError("MetaMask is not installed. Please install MetaMask extension.")
          setIsConnecting(false)
          return
        }
      } else if (walletId === "okx") {
        if (typeof window !== "undefined" && (window as any).okxwallet) {
          provider = (window as any).okxwallet
        } else {
          setError("OKX Wallet is not installed. Please install OKX Wallet extension.")
          setIsConnecting(false)
          return
        }
      } else if (walletId === "walletconnect") {
        setError("WalletConnect integration coming soon.")
        setIsConnecting(false)
        return
      }

      if (provider) {
        const accounts = await provider.request({ method: "eth_requestAccounts" })
        if (accounts && accounts.length > 0) {
          onConnect(accounts[0], walletId)
          onClose()
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" />

        <div className="relative flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Connect Wallet</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select your wallet to continue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all duration-300 group"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="relative p-8 space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id)}
              disabled={isConnecting}
              className="w-full flex items-center gap-4 p-5 rounded-2xl backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-primary/40 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative w-14 h-14 flex items-center justify-center bg-white/5 rounded-xl group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 border border-white/10">
                <img src={wallet.logo || "/placeholder.svg"} alt={wallet.name} className="w-8 h-8" />
              </div>
              <div className="relative flex-1 text-left">
                <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                  {wallet.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{wallet.description}</div>
              </div>
              {isConnecting && (
                <div className="relative w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </button>
          ))}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 backdrop-blur-xl">
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="relative px-8 pb-8 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
