import { Row, Col } from "react-bootstrap";

function What(props) {
    const size = {
        row: [12],
    }
    
    return (
        <Row className="pt-2">
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <h5>More Transactions More Lucky</h5>
            </Col>
        </Row>
    )
}

export default What;