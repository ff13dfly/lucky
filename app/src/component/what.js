import { Row, Col } from "react-bootstrap";

function What(props) {
    const size = {
        row: [12],
        left:[8,4],
    }
    
    return (
        <Row className="pt-2">
            <Col sm={size.row[0]} xs={size.row[0]}>
                <h3>
                    Turns Solana transactions into a "hidden lottery".<br/>
                    "Gene" allows endless expansion for anyone.
                </h3>
                <hr />
            </Col>
            <Col className="" sm={size.left[0]} xs={size.left[0]}> 
                <h4>1️⃣ Every Transaction Signature as "Lottery Ticket"</h4>
                <h5>Each transaction signature can be used to determine if you win.</h5>  
                <h5>Your regular transactions automatically become your lottery entries! </h5>
                <h5>More transaction more lucky! </h5> 
                <br />

                <h4>3️⃣ Instantly Visible—Easily Check If You Win</h4>
                <h5>Winning results are displayed through <strong>visual patterns</strong> as image.</h5>  
                <h5>You can immediately see if you’ve won—no need for complex calculations!</h5>
                <br />

                <h4>2️⃣ " Signature + Gene " Combination to Determine Winning</h4> 
                <h5>"Gene" is a set of on-chain data rules as a protocol.</h5>
                <h5>Different “genes” have different winning conditions. </h5>
                <h5>One signature can be used to test with different genes, much more lucky!</h5>
                <br />

                <h4>4️⃣ Multi-Block Hash Mixing for Randomness</h4>
                <h5>LuckySig invested a new Anti-Cheating Mechanism, it combines multiple block hashes, preventing miners from manipulating the results.</h5>
                <h5>This ensures fairness, no one can predict or manipulate the winning outcomes!</h5>
                <br />
            </Col>
            <Col className="text-center" sm={size.left[1]} xs={size.left[1]}>
                <h3>Signature</h3>
                <h3>+</h3>
                <h3>Gene</h3>
                <h3>=</h3>
                <h3>Result</h3>
            </Col>
        </Row>
    )
}

export default What;