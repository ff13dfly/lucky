import { Row, Col } from "react-bootstrap";

function GeneOverview(props) {
    const size = {
        row: [12],
    }
    
    return (
        <Row className="pt-2">
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <h5>Gene list here and create gene here.</h5>
            </Col>
        </Row>
    )
}

export default GeneOverview;