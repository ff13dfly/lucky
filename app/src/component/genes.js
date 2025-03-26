import { Row, Col } from "react-bootstrap";

function GeneOverview(props) {
    const size = {
        row: [12],
        left:[8,4]
    }
    
    return (
        <Row className="pt-2">
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <h5>Gene list here and create gene here.</h5>
            </Col>

            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>
            <Col className="pt-2 text-info" sm={size.left[0]} xs={size.left[0]}>
                Creating your own gene right now.
            </Col>

            <Col className="text-end" sm={size.left[1]} xs={size.left[1]}>
                <button className="btn btn-lg btn-primary" onClick={(ev)=>{

                }}> + New Gene </button>
            </Col>
        </Row>
    )
}

export default GeneOverview;