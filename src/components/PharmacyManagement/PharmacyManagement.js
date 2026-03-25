import React, { useEffect, useState } from 'react'
import { CTabs, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'

import MedicineTemplate from '../PharmacyManagement/MedicineTemplate'
import Inventory from '../PharmacyManagement/Inventory'
import OPSales from '../PharmacyManagement/OPSales'
import SalesReturns from '../PharmacyManagement/SalesReturns'
import Purchases from '../PharmacyManagement/Purchases'
import StockReturns from '../PharmacyManagement/StockReturns'
import MoneyReceipts from '../PharmacyManagement/MoneyReceipts'
import SupplierInfo from '../PharmacyManagement/SupplierInfo'
import AddMedicine from './AddMedicine'
import PharmacyReports from './PharmacyReports'
import  OrderDetails  from './Reorder/OrderDetails'
import {ordersData} from './Reorder/dummyProductData'

const PharmacyManagement = () => {
  const [activeKey, setActiveKey] = useState(0)

  useEffect(() => {
    if (ordersData && ordersData.products) {
      setProducts(ordersData.products)
       console.log(ordersData)
    }
  }, [ordersData])
  return (
    <div className="pharmacy-management w-100">
      <CTabs activeKey={activeKey}>
        <CNav variant="tabs" className="pm-tabs">
          <CNavItem>
            <CNavLink
              active={activeKey === 0}
              onClick={() => setActiveKey(0)}
              style={{ color: 'var(--color-black)',cursor:'pointer' }}
            >
              Add Medicine 
            </CNavLink>
          </CNavItem>
              <CNavItem>
            <CNavLink
              active={activeKey === 1}
              onClick={() => setActiveKey(1)}
              style={{ color: 'var(--color-black)',cursor:'pointer' }}
            >
              Medicine Template
            </CNavLink>
          </CNavItem>
         
          <CNavItem>
            <CNavLink
              active={activeKey === 2}
              onClick={() => setActiveKey(2)}
              style={{ color: 'var(--color-black)' ,cursor:'pointer'}}
            >
              OP Sales
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 3}
              onClick={() => setActiveKey(3)}
              style={{ color: 'var(--color-black)' ,cursor:'pointer'}}
            >
              Sales Returns
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 4}
              onClick={() => setActiveKey(4)}
              style={{ color: 'var(--color-black)' ,cursor:'pointer'}}
            >
              Purchases
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 5}
              onClick={() => setActiveKey(5)}
              style={{ color: 'var(--color-black)' ,cursor:'pointer'}}
            >
              Stock Returns
            </CNavLink>
          </CNavItem>
           <CNavItem>
            <CNavLink
              active={activeKey === 6}
              onClick={() => setActiveKey(6)}
              style={{ color: 'var(--color-black)' ,cursor:'pointer'}}
            >
              Inventory
            </CNavLink>
          </CNavItem>
           <CNavItem>
            <CNavLink
              active={activeKey === 7}
              onClick={() => setActiveKey(7)}
              style={{ color: 'var(--color-black)',cursor:'pointer' }}
            >
              Suppliers
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 8}
              onClick={() => setActiveKey(8)}
              style={{ color: 'var(--color-black)' ,cursor:'pointer'}}
            >
              Money Receipts
            </CNavLink>
          </CNavItem>
           <CNavItem>
            <CNavLink
              active={activeKey === 9}
              onClick={() => setActiveKey(9)}
              style={{ color: 'var(--color-black)',cursor:'pointer' }}
            >
              Reports
            </CNavLink>
          </CNavItem>
            <CNavItem>
            <CNavLink
              active={activeKey === 10}
              onClick={() => setActiveKey(10)}
              style={{ color: 'var(--color-black)',cursor:'pointer' }}
            >
              Order Details
            </CNavLink>
          </CNavItem>
         
        </CNav>

        <CTabContent className="mt-3">
          <CTabPane visible={activeKey === 0}>
            <AddMedicine/>
          </CTabPane>
         < CTabPane visible={activeKey === 1}>
            <MedicineTemplate />
          </CTabPane>
          
          <CTabPane visible={activeKey === 2}>
            <OPSales />
          </CTabPane>
          <CTabPane visible={activeKey === 3}>
            <SalesReturns />
          </CTabPane>
          <CTabPane visible={activeKey === 4}>
            <Purchases goToSupplier={() => setActiveKey(7)} />
          </CTabPane>
          <CTabPane visible={activeKey === 5}>
            <StockReturns />
          </CTabPane>
          <CTabPane visible={activeKey === 6}>
            <Inventory />
          </CTabPane>
           <CTabPane visible={activeKey === 7}>
            <SupplierInfo />
          </CTabPane>
          <CTabPane visible={activeKey === 8}>
            <MoneyReceipts />
          </CTabPane>
         
          <CTabPane visible={activeKey === 9}>
            <PharmacyReports />
          </CTabPane>
          <CTabPane visible={activeKey === 10}>
            <OrderDetails />
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  )
}

export default PharmacyManagement