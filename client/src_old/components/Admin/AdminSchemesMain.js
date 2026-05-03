import React from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Rejected from '../AuthenticateFarmer/Farmer_schemes/Rejected';
import AddSchemes from './AddSchemes';
import AdminAppliedSchemes from './AdminAppliedSchemes';
import AdminApprovedSchemes from './AdminApprovedSchemes';
import AdminExpiredSchemes from './AdminExpiredSchemes';
import AdminRejectedSchemes from './AdminRejectedSchemes';
import AdmindeletedSchemes from './AdmindeletedSchemes';
import AdminSchemes from './AdminSchemes';
// import Applied from './Applied';


function AdminSchemesMain() {
  return (
    <>
    <div className='Main_admin_Schemes'>
      <div className='Mainin_admin_Schemes'>
    <div  className="test">
    <Tabs
      defaultActiveKey="profile"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      <Tab  eventKey="profile"  title="Active Schemes">
      <AdminSchemes />
      </Tab>
      <Tab  eventKey="home" title="Pending Applications">
        <h1>Pending Applications</h1>
        <AdminAppliedSchemes/>
      </Tab>
      {/* <Tab eventKey="contact" title="Approved Schemes" >
        <h1>Approved Schemes</h1>
        <AdminApprovedSchemes/>
     </Tab>
      <Tab eventKey="Reject" title="Rejected Schemes" >
        <h1>Rejected Schemes</h1>
        <AdminRejectedSchemes/>
     </Tab> */}
      <Tab eventKey="info" title="Add New Scheme" >
        <AddSchemes/>
     </Tab>
      <Tab eventKey="Expired Schemes" title="Expired Schemes" >
        <h1>Expired Schemes</h1>
        <AdminExpiredSchemes/>
     </Tab>
      <Tab eventKey="Deleted Schemes" title="Deleted Schemes" >
        <h1>Deleted Schemes</h1>
        <AdmindeletedSchemes/>
     </Tab>
    </Tabs>
    </div>
    </div>
    </div>
    </>
  )
}

export default AdminSchemesMain