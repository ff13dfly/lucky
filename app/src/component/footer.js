import { Container,Row, Col } from "react-bootstrap";

function Footer(props) {
    const size = {
        row: [12],
    }
    
    return (
        <Container className="footer">
            <Row className="pt-2">
                <Col className="text-center content" sm={size.row[0]} xs={size.row[0]}>
                    Solana version 0.1.1
                </Col>
                <Col className="text-center content" sm={size.row[0]} xs={size.row[0]}>
                    Copyright 2025 LuckySig
                </Col>
            </Row>
        </Container>
    )
}

export default Footer;