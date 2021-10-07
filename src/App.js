import './App.css';
import React, {useState, useEffect} from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";


const valmonth = []; // list of months
const customerName = []; // list of customerName
const customerData = []; // list of all txn data
const customerTotalData = []; // list of all total txn data by month
let expnadData = [];

function App() {
const [customerArray, setCustomerArray] = useState([]);
const [symbol, setSymbol] = useState("$"); // Currency Symbol
  useEffect(() => {
    fetch("./data.json", {
      method: 'get' // *GET, POST, PUT, DELETE, etc.
      })
      .then((response) => {
        return response.json();
      }).then((results) => {
         calculateRewardPoints(results); // function to calculate reward points and total txns of a customer in a month
      }).catch((error)=>{
      })
  },[]);

  const calculateRewardPoints = (results) => {
    results.forEach((item, i )=> {
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = new Date(item.date).getMonth();
    if (valmonth.includes(monthName[month]) === false) valmonth.push(monthName[month]);
    if (customerName.includes(item.name) === false) customerName.push(item.name);
    let rewardPoints = 0;
    if (item.amt > 100) {  // when purchase is more than $100
      let amount = item.amt - 100;
      rewardPoints += (amount * 2 + 50);
    }    
    if (item.amt > 50 && item.amt < 100) { // when purchase is more than $50 and less than $100
      let amount = 100 - item.amt;
      amount = 50 - amount;
      rewardPoints += (amount * 1); 
    }
    const custObj = {id:i, date:item.date, name:item.name, monthName:monthName[month], txn:item.amt, points:rewardPoints};
    customerData.push(custObj);
    });

    valmonth.forEach((item, i)=>{
      const newAr = customerData.filter((vn) => vn.monthName == item);  
      customerName.forEach((cn, n) => {
      const newAr2 = newAr.filter((vn) => vn.name == cn);  
      let points = newAr2.reduce((accumulator, item) => {
        return accumulator + item.points;
      }, 0);
      let txn = newAr2.reduce((accumulator, item) => {
        return accumulator + item.txn;
      }, 0);
      const obj = {};
      obj["id"] = new Date().getTime() + Math.random();
      obj["name"] = cn;
      obj["month"] = item;
      obj["points"] = symbol+points;
      obj["txn"] = symbol+txn;
      customerTotalData.push(obj);
    });
    });
    setCustomerArray(customerTotalData)
  }

  const columns = [{
    dataField: 'name',
    text: 'Customer Name'
  },  {
    dataField: 'month',
    text: 'Transaction Month'
  },{
    dataField: 'txn',
    text: 'Total Transaction Amount'
  },{
    dataField: 'points',
    text: 'Total Reward Points'
  }
  ];

  const expandFn = (row)=>{
      const newAr = customerData.filter((vn) => vn.name == row.name && vn.monthName == row.month); 
      expnadData = newAr;
  }

  const options = {
    paginationSize: 4,
    pageStartIndex: 1,
    firstPageText: 'First',
    prePageText: 'Back',
    nextPageText: 'Next',
    lastPageText: 'Last',
    nextPageTitle: 'First page',
    prePageTitle: 'Pre page',
    firstPageTitle: 'Next page',
    lastPageTitle: 'Last page',
    showTotal: true,
    disablePageTitle: true,
    sizePerPageList: [{
      text: '5', value: 5
    }, {
      text: '10', value: 10
    }] // A numeric array is also available. the purpose of above example is custom the text
  };

  
  const expandRow = {
    renderer: (row, rowIndex) => (
      <div>
        <p>{ `Transaction Details of Month ${row.month}` }</p>
        <table>
         <thead>
           <tr>
            <th>Date</th>
            <th>Customer Name</th> 
            <th>Transaction Amount</th>
            <th>Reward Points</th> 
           </tr>
         </thead>   
         <tbody>
        {expnadData &&
        expnadData.map((e)=>{
          return(<tr>
            <td>{e.date}</td>
            <td>{e.name}</td>
            <td>{e.monthName}</td>
            <td>${e.txn}</td>  
            </tr>)
        })}
        </tbody>
        </table> 
      </div>
    ),
    showExpandColumn: true,
    expandColumnPosition: 'right',
    onlyOneExpanding: true,
    expandHeaderColumnRenderer: ({ isAnyExpands }) => (
      isAnyExpands=null
    ),
    expandColumnRenderer: ({expanded, rowKey, expandable}) => {
      return (
          <button type="button" className="btn btn-outline-primary btn-sm">View Details</button>
      );
    }, onExpand: (row, isExpand, rowIndex, e) => {
      expandFn(row);
    }
    };

    return (
        <div className="App">
          <div className="container">
          <h1 className="mt-3">Reward Points</h1>
          <div>
          {customerArray &&
          <BootstrapTable
          keyField='id'
          data={ customerArray }
          columns={ columns }
          expandRow={ expandRow }
          pagination={  paginationFactory(options)}
        />
          }
          </div>
          </div>
        </div>
      );
    }

export default React.memo(App);
