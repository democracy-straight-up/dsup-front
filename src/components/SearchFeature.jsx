import { useState } from "react";
import { useSelector } from "react-redux";
import { Container, Form, Table } from "react-bootstrap";

function SearchFeature() {
  const bills = useSelector((state) => state.bills.bills);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBills = bills?.filter((bill) => {
    return bill.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen flex items-center justify-center">
      <Container>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Search for a Bill</Form.Label>
            <Form.Control
              placeholder="SEARCH FUNCTION CURRENTLY IN BETA"
              onChange={(e) => handleSearchChange(e)}
            />
          </Form.Group>
        </Form>
      </Container>
      <Container>
        <Table striped bordered hover responsive>
          <thead>
            <tr className="bills-list-voter-page-header-row">
              <th>HR #</th>
              <th>Short Title</th>
              <th>Latest Action</th>
              <th>Your Vote</th>
              <th>Advisement</th>
              <th>District Tally</th>
              <th>National Tally</th>
              <th>Bill Link</th>
              <th>Metrics</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.slice(0, 10).map((bill, index) => (
              <tr key={index}>
                <td>{bill.number}</td>
                <td>{bill.title}</td>
                {/* Include other bill properties as needed */}
                <td>{bill.latest_action_date}</td>
                <td>{bill.your_vote}</td>
                {/* Need to add advisement as an attribute on the bills model*/}
                <td>{bill.advisement}</td>
                <td>{bill.district_tally}</td>
                <td>{bill.national_tally}</td>
                <td>
                  <a href={bill.url}>Link</a>
                </td>
                <td>TBD</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
}

export default SearchFeature;
