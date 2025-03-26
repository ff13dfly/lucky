import { Row, Col, Image } from "react-bootstrap";
import { useEffect,useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import { FaQuestion } from "react-icons/fa";

import What from "./what";
import Portal from "./portal";

function Header(props) {
    const size = {
        row: [12],
        nav: [5,4,3],
        left:[4,8],
        what:[6,6],
    }
    let [ hidden, setHidden ] = useState(true);

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
                <Row>
                    <Col className="" sm={size.left[0]} xs={size.left[0]}>
                        <Image
                            src={`${window.location.origin}/image/logo.png`}
                            width="100%"
                        />
                    </Col>
                    <Col className="pt-1" sm={size.left[1]} xs={size.left[1]}>
                        <button className="btn btn-md btn-info" onClick={(ev)=>{
                            self.clickWhat(ev);
                        }}> 
                            <FaQuestion size={18} color={"white"}/>
                        </button>
                    </Col>
                </Row>
                
                {/* <Demo /> */}
            </Col>
            <Col className="pt-2 text-end" sm={size.nav[1]} xs={size.nav[1]}>
                <button hidden={hidden} className="btn btn-lg btn-warning pl-2" onClick={(ev)=>{
                    self.clickPortal(ev);
                }}>Portal</button>
            </Col>
            <Col className="pt-2 text-end" sm={size.nav[2]} xs={size.nav[2]}>
                <WalletMultiButton className="btn-md"/> 
            </Col>
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
        </Row>
    )
}

export default Header;