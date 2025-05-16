import { Row, Col } from "react-bootstrap";

import { useState, useEffect } from "react";
import Gene from "../lib/gene";

import GeneCreate from "./create";

function GeneOverview(props) {
    const size = {
        row: [12],
        left:[8,4],
        grid:[4],
    }

    let [ list, setList ] = useState([]);

    const self={
        clickNewGene:(ev)=>{
            //console.log(props.dialog);
            props.dialog.hide();
            setTimeout(()=>{
                props.dialog.show(<GeneCreate />,"Create new gene");
            },500);
        },
        fresh:async ()=>{
            Gene.list((data)=>{
                if(data.error){
                    return false;
                }
                console.log(data);
                const arr=[];
                for(let name in data){
                    const row=data[name];
                    row.name=name;
                    arr.push(row);
                }
                
                setList(arr);
            });
        }
    }

    useEffect(() => {
        self.fresh();
    }, []);
    
    return (
        <Row className="pt-2">
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    {list.map((row, index) => (
                        <Col className="" key={index} sm={size.grid[0]} xs={size.grid[0]}>
                            <h4>{row.name}</h4>
                        </Col>
                    ))} 
                </Row>
            </Col>

            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col className="pt-2 text-info" sm={size.left[0]} xs={size.left[0]}>
                Creating your own gene right now.
            </Col>

            <Col className="text-end" sm={size.left[1]} xs={size.left[1]}>
                <button className="btn btn-lg btn-primary" onClick={(ev)=>{
                    self.clickNewGene(ev);
                }}> + New Gene </button>
            </Col>
        </Row>
    )
}

export default GeneOverview;