import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

function GeneCreate(props) {
    const size = {
        row: [12],
        left:[8,4]
    }

    let [ list, setList ] = useState([]);

    const self={
        clickNewGene:(ev)=>{
            
        },
        fresh:()=>{
        }
    }

    useEffect(() => {
        self.fresh();
    }, []);
    
    return (
        <Row className="pt-2">
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <input type="text" className="form-control" placeholder="Input the web3.storage CID."/>   
            </Col>

            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-lg btn-primary">Create New Gene Now</button>
            </Col>
        </Row>
    )
}

export default GeneCreate;