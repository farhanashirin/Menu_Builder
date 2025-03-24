import axios from "axios";
import { useEffect, useState } from "react";
import { 
  Button,
  Form,
  Card,
  Row,
  Col,
  Stack,
  Modal
} from "react-bootstrap";
import "../../src/index.css"
import { Navbar, Nav, Container } from 'react-bootstrap';

//API
const API_URL = 'http://localhost:5000/api/menus';
//Theme
const themeColors = {
    dark: "#1a1a1a",
    gold: "#FFD700",
    light: "#f8f9fa",
    secondary: "#6c757d"
  };
  

const AddMenuSystem = () => {
    //states
  const [menus, setMenus] = useState([]);

  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuFormData, setMenuFormData] = useState({ name: "", description: "" });
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingItem, setEditingItem] = useState({ menuId: null, itemId: null });
  const [showDeleteMenuConfirm, setShowDeleteMenuConfirm] = useState(false);
//Toggles item form
  const toggleItem = (menuId) => {
    const updatedMenus = menus.map(menu => 
      menu._id === menuId ? { ...menu, showItemForm: !menu.showItemForm } : menu
    );
    setMenus(updatedMenus);
  };
  //data fetching

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get(API_URL);
        setMenus(response.data);
        if (response.data.length > 0) {
          setSelectedMenuId(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };
    fetchMenus();
  }, []);
  // creation of new menu

  const handleAddMenu = async (e) => {
    e.preventDefault();
    if (menuFormData.name.trim() !== "") {
      try {
        const response = await axios.post(API_URL, menuFormData);
        setMenus(prev => [...prev, response.data]);
        setMenuFormData({ name: "", description: "" });
        setShowMenuForm(false);
        setSelectedMenuId(response.data._id);
      } catch (error) {
        console.error('Error adding menu:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Error adding menu');
      }
    }
  };
//edit menu
  const handleEditMenu = async () => {
    try {
      const response = await axios.put(`${API_URL}/${editingMenu._id}`, editingMenu);
      
      setMenus(prev => 
        prev.map(menu => 
          menu._id === editingMenu._id ? 
          { ...response.data, items: menu.items } : 
          menu
        )
      );
      
     
      setSelectedMenuId(editingMenu._id);
      setEditingMenu(null);
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('Error updating menu');
    }
  };
//delete menu
  const handleDeleteMenu = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedMenuId}`);
      const updatedMenus = menus.filter(menu => menu._id !== selectedMenuId);
      setMenus(updatedMenus);
      
      if (updatedMenus.length > 0) {
        const newIndex = Math.max(0, menus.findIndex(menu => menu._id === selectedMenuId) - 1);
        setSelectedMenuId(updatedMenus[newIndex]?._id || updatedMenus[0]?._id);
      } else {
        setSelectedMenuId(null);
      }
      
      setShowDeleteMenuConfirm(false);
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Error deleting menu');
    }
  };
//add item
  const handleAddItem = async (e, menuId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const itemData = {
      name: formData.get("itemName").trim(),
      description: formData.get("itemDescription").trim(),
      price: parseFloat(formData.get("itemPrice").trim())
    };
  
    if (!itemData.name || isNaN(itemData.price)) {
      alert('Please provide valid item name and price');
      return;
    }
  
    try {
      const response = await axios.post(
        `${API_URL}/${menuId}/items`,
        itemData
      );
      e.target.reset();
      setMenus(prev => 
        prev.map(menu => 
          menu._id === menuId ? response.data : menu
        )
      );
    } catch (error) {
      console.error('Error adding item:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error adding item');
    }
  };
//edit item
  const handleEditItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const price = parseFloat(formData.get("itemPrice").trim());
    
    if (isNaN(price)) {
      alert('Please enter a valid price');
      return;
    }
  
    const itemData = {
      name: formData.get("itemName").trim(),
      description: formData.get("itemDescription").trim(),
      price
    };
  
    try {
      const response = await axios.put(
        `${API_URL}/${editingItem.menuId}/items/${editingItem.itemId}`,
        itemData
      );
      
      setMenus(prev => 
        prev.map(menu => 
          menu._id === editingItem.menuId ? 
          { ...menu, items: menu.items.map(item => 
            item._id === editingItem.itemId ? response.data : item
          )} : 
          menu
        )
      );
      
      setEditingItem({ menuId: null, itemId: null });
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`Error updating item: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteItem = async (menuId, itemId) => {
    try {
      await axios.delete(`${API_URL}/${menuId}/items/${itemId}`);
      setMenus(prev => 
        prev.map(menu => 
          menu._id === menuId ? 
          { ...menu, items: menu.items.filter(item => item._id !== itemId) } : 
          menu
        )
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  return (

    
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: themeColors.dark }}>
{/* header */}
<Navbar bg="dark" variant="dark" expand="lg" className="py-3 border-bottom border-secondary">
      <Container>
        <Navbar.Brand href="#home">
          <h1 className="mb-0 text-center" style={{ color: themeColors.gold, letterSpacing: '2px' }}>
            DEEP NET SOFT
          </h1>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="gap-4">
            <Nav.Link href="#home" className="text-uppercase" style={{ color: themeColors.gold }}>Home</Nav.Link>
            <Nav.Link href="#new" className="text-uppercase" style={{ color: themeColors.gold }}>New!</Nav.Link>
            <Nav.Link href="#menu" className="text-uppercase" style={{ color: themeColors.gold }}>Menu</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    {/* main content */}
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="w-100" style={{ maxWidth: "800px" }}>
        <Card className="shadow-lg mx-2">
          <Card.Body>
          {/* Menu Selection Tabs */}
            <Row className="g-2 mb-4 flex-wrap">
              {menus.map(menu => (
                <Col xs="auto" key={menu._id}>
                  <Button
                    variant={selectedMenuId === menu._id ? "primary" : "outline-primary"}
                    onClick={() => setSelectedMenuId(menu._id)}
                    className=" d-flex flex-column align-items-center"
                    // Styling for menu tabs
                    style={{
  transition: 'background 0.3s ease, transform 0.2s ease',
  width: 'auto', 
  minWidth: '120px',
  height: '48px', 
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px', 
  padding: '35px 20px', 
  background: '#007bff', 
  color: '#fff',
  fontWeight: '600', 
  fontSize: '16px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)', 
  outline: 'none',
  textTransform: 'uppercase', 
  letterSpacing: '1px', 
  userSelect: 'none', 
}}
onHover={{
  background: '#0056b3', 
  transform: 'scale(1.05)', 
}}
onFocus={{
  outline: '2px solid rgba(0, 123, 255, 0.5)', 
}}
onActive={{
  transform: 'scale(0.98)',
}}


                  >
                    <span>{menu.name}</span>
                    <Button
                      variant="warning"
                      className="mt-2 p-1 d-flex align-items-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '20%',
                        opacity: '0.8',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMenu(menu);
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="currentColor" 
                        className="bi bi-pencil-fill" 
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                      </svg>
                    </Button>
                  </Button>
                </Col>
              ))}
              <Col xs="auto">
                <Button
                  variant="success"
                  onClick={() => setShowMenuForm(true)}
                  className="rounded-pill"
                >
                  + Add Menu
                </Button>
              </Col>
            </Row>
{/* menu form */}
            {showMenuForm && (
              <Card className="mb-4 border-primary">
                <Card.Body>
                  <Form onSubmit={handleAddMenu}>
                    <Row className="g-3 align-items-center">
                      <Col md={5}>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Menu Name"
                          value={menuFormData.name}
                          onChange={(e) => setMenuFormData({
                            ...menuFormData,
                            name: e.target.value
                          })}
                          required
                        />
                      </Col>
                      <Col md={5}>
                        <Form.Control
                          type="text"
                          name="description"
                          placeholder="Menu Description"
                          value={menuFormData.description}
                          onChange={(e) => setMenuFormData({
                            ...menuFormData,
                            description: e.target.value
                          })}
                        />
                      </Col>
                      <Col md={2}>
                        <Button variant="primary" type="submit" className="w-100">
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            )}
{/* menu edit modal */}
            <Modal show={!!editingMenu} onHide={() => setEditingMenu(null)}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Menu</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleEditMenu}>
                  <Form.Group className="mb-3">
                    <Form.Label>Menu Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingMenu?.name || ''}
                      onChange={(e) => setEditingMenu({
                        ...editingMenu,
                        name: e.target.value
                      })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={editingMenu?.description || ''}
                      onChange={(e) => setEditingMenu({
                        ...editingMenu,
                        description: e.target.value
                      })}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setEditingMenu(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
{/* confirmation modal  for delete */}
            <Modal show={showDeleteMenuConfirm} onHide={() => setShowDeleteMenuConfirm(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this menu and all its items?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteMenuConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteMenu}>
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>
{/* selected menu content */}
            {menus.map(menu => (
  selectedMenuId === menu._id && (
    <div key={menu._id}>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3 className="text-primary mb-2">{menu.name}</h3>
          {menu.description && (
            <p className="text-muted mb-0" style={{ maxWidth: "600px" }}>
              {menu.description}
            </p>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-success"
            size="sm"
            onClick={() => toggleItem(menu._id)}
            className="rounded-pill"
          >
            + Add Item
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setShowDeleteMenuConfirm(true)}
            className="rounded-pill"
          >
            Delete Menu
          </Button>
        </div>
      </div>
{/* item lists */}
                  <Stack gap={3} style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {menu.items.map(item => (
                      <Card key={item._id} className="border-0 shadow-sm">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col>
                              <h5 className="mb-1">{item.name}</h5>
                              <p className="text-muted mb-0">{item.description}</p>
                            </Col>
                            <Col xs="auto" className="d-flex align-items-center gap-2">
                              <h5 className="mb-0 text-success">₹{item.price}</h5>
                              <Button
                                variant="link"
                                onClick={() => setEditingItem({ 
                                  menuId: menu._id, 
                                  itemId: item._id 
                                })}
                              >
                                <i class="fa-solid fa-pencil"></i>
                              </Button>
                              <Button
                                variant="link"
                                className="text-danger"
                                onClick={() => handleDeleteItem(menu._id, item._id)}
                              >
                                <i class="fa-solid fa-delete-left"></i>
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Stack>
{/* item creation form */}
                  {menu.showItemForm && (
                    <Card className="mt-4 border-success">
                      <Card.Body>
                        <Form onSubmit={(e) => handleAddItem(e, menu._id)}>
                          <Row className="g-3 align-items-center">
                            <Col md={4}>
                              <Form.Control
                                type="text"
                                name="itemName"
                                placeholder="Item Name"
                                required
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Control
                                type="text"
                                name="itemDescription"
                                placeholder="Description"
                              />
                            </Col>
                            <Col md={2}>
                              <Form.Control
                                type="number"
                                name="itemPrice"
                                placeholder="Price"
                                required
                              />
                            </Col>
                            <Col md={2}>
                              <Button variant="success" type="submit" className="w-100">
                                Add
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Card.Body>
                    </Card>
                  )}
{/* item edit modal */}
                  <Modal 
                    show={editingItem.menuId === menu._id} 
                    onHide={() => setEditingItem({ menuId: null, itemId: null })}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Edit Item</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {editingItem.menuId === menu._id && (
                        <Form onSubmit={handleEditItem}>
                          <Form.Group className="mb-3">
                            <Form.Label>Item Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="itemName"
                              defaultValue={menu.items.find(i => i._id === editingItem.itemId)?.name}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              name="itemDescription"
                              defaultValue={menu.items.find(i => i._id === editingItem.itemId)?.description}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                              type="number"
                              name="itemPrice"
                              defaultValue={menu.items.find(i => i._id === editingItem.itemId)?.price}
                              required
                            />
                          </Form.Group>
                          <div className="d-flex justify-content-end gap-2">
                            <Button 
                              variant="secondary" 
                              onClick={() => setEditingItem({ menuId: null, itemId: null })}
                            >
                              Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                              Save Changes
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Modal.Body>
                  </Modal>
                </div>
              )
            ))}
          </Card.Body>
        </Card>
      </div>
    </div>
    {/* footer */}
    <Card.Footer className="text-center py-4 border-top border-secondary" style={{ backgroundColor: themeColors.dark }}>
        <Row className="g-4">
          <Col md={4}>
            <h5 className="text-uppercase" style={{ color: themeColors.gold }}>Contact Us</h5>
            <p className="mb-1" style={{ color: themeColors.light }}>+91-9657645300</p>
            <p className="mb-1" style={{ color: themeColors.light }}>info@deepnetsoft.com</p>
            <p className="mb-0" style={{ color: themeColors.secondary }}>First flour, Diet infopath</p>
          </Col>
          
          <Col md={4}>
            <h5 className="text-uppercase" style={{ color: themeColors.gold }}>Quick Links</h5>
            <div className="d-flex flex-column gap-2">
              <a href="#terms" style={{ color: themeColors.light }}>Terms & Conditions</a>
              <a href="#privacy" style={{ color: themeColors.light }}>Privacy Policy</a>
            </div>
          </Col>
          
          <Col md={4}>
            <h5 className="text-uppercase" style={{ color: themeColors.gold }}>Follow Us</h5>
            <div className="d-flex justify-content-center gap-3">
              <a href="#facebook" style={{ color: themeColors.light }}>
                <i className="fab fa-facebook fa-lg"></i>
              </a>
              <a href="#twitter" style={{ color: themeColors.light }}>
                <i className="fab fa-twitter fa-lg"></i>
              </a>
              <a href="#instagram" style={{ color: themeColors.light }}>
                <i className="fab fa-instagram fa-lg"></i>
              </a>
            </div>
          </Col>
        </Row>
        
        <div className="mt-4 pt-3 border-top border-secondary">
          <p className="mb-0" style={{ color: themeColors.secondary }}>
            © 2024 Deepnetsoft Solutions. All rights reserved.
          </p>
        </div>
      </Card.Footer>

    </div>
    

    
  );
};

export default AddMenuSystem;