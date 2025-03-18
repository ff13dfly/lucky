import { Row, Col, Image } from "react-bootstrap";
import { useEffect,useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import What from "./what";
import Portal from "./portal";

function Header(props) {
    const size = {
        row: [12],
        nav: [2,7,3]
    }
    let [ hidden, setHidden ] = useState(false);

    const self={
        clickWhat:(ev)=>{
            props.dialog.show(<What dialog={props.dialog}/>,"What's LuckySig?");
        },
        clickPortal:(ev)=>{
            props.dialog.show(<Portal dialog={props.dialog}/>,"LuckySig Portal");
        },
    }
    const wallet = useWallet();
    useEffect(() => {
        if(wallet.publicKey!==null){
            setHidden(wallet.publicKey.toString()!=="GTNgXEzmG2E2d9yX8fwueP4bD2WCgJ3mqvt7sQj6CYYr");
        }
    }, [wallet.publicKey]);
    return (
        <Row className="pt-2">
            <Col className="" sm={size.nav[0]} xs={size.nav[0]}>
                <Image
                    src={`${window.location.origin}/image/logo.png`}
                    width="100%"
                />
                {/* <Demo /> */}
            </Col>
            <Col className="pt-2 text-end" sm={size.nav[1]} xs={size.nav[1]}>
                <button className="btn btn-lg btn-info" onClick={(ev)=>{
                    self.clickWhat(ev);
                }}>What's LuckySig?</button>
                <button hidden={hidden} className="btn btn-lg btn-warning pl-2" onClick={(ev)=>{
                    self.clickPortal(ev);
                }}>Portal</button>
            </Col>
            <Col className="pt-2 text-end" sm={size.nav[2]} xs={size.nav[2]}>
                <WalletMultiButton /> 
            </Col>
        </Row>
    )
}

export default Header;