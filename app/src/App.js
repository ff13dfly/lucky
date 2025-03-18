import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

import { Container, Modal } from "react-bootstrap";
import { useState, useEffect, useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

import Header from "./component/header";
import Search from "./component/search";
import Footer from "./component/footer";

export const WalletConnectionProvider = ({ children }) => {
  const endpoint = clusterApiUrl("devnet");
  const wallets = useMemo(() => [
    new UnsafeBurnerWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

function App() {

  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const dialog={
    show:(ctx,head_title)=>{
      setTitle(head_title);
      setContent(ctx);
      setShow(true);
    },
    hide:()=>{
      setTitle("");
      setContent("");
      setShow(false);
    },
  }

  useEffect(() => {

  }, []);

  return (
    <WalletConnectionProvider>
      <Container style={{paddingBottom:"100px"}}>
        <Header dialog={dialog}/>
        <Search dialog={dialog}/>
        <Footer dialog={dialog}/>
        <Modal className="modal-details unselect"
          show={show}
          size="lg"
          backdrop="static"
          onHide={(ev) => {
            setShow(false);
          }}
          centered={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {content}
          </Modal.Body>
        </Modal>
      </Container>
    </WalletConnectionProvider>
  );
}

export default App;
