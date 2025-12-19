import { useEffect, useState } from "react";
import './productmanagement.css'

export default function ProductManagement() {
  const [products,setProducts]=useState([]);
  const [form,setForm]=useState({name:"",description:"",price:"",stock:"",imageUrl:""});
  const [editId,setEditId]=useState(null);
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState("");

  useEffect(()=>{fetchProducts();},[]);

  const fetchProducts=async()=>{const res=await fetch("http://localhost:4000/products");setProducts(await res.json());};
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const handleSubmit=async(e)=>{
    e.preventDefault();
    const {name,price,stock}=form;
    if(!name||price<=0||stock<0){showToast("Invalid Name/Price/Stock");return;}
    setLoading(true);
    try{
      if(editId){
        await fetch(`http://localhost:4000/products/${editId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
        showToast("Product updated");
      }else{
        if(products.find(p=>p.name===form.name)){showToast("Duplicate product");setLoading(false);return;}
        await fetch("http://localhost:4000/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
        showToast("Product added");
      }
      setForm({name:"",description:"",price:"",stock:"",imageUrl:""});
      setEditId(null);
      fetchProducts();
    }catch(e){showToast("Error");}finally{setLoading(false);}
  };

  const handleEdit=(p)=>{setForm(p);setEditId(p.id);};
  const handleDelete=async(id)=>{if(!window.confirm("Confirm delete?"))return;await fetch(`http://localhost:4000/products/${id}`,{method:"DELETE"});showToast("Deleted");fetchProducts();};

  const handleImage=async(e)=>{
    const file=e.target.files[0];
    const formData=new FormData();
    formData.append("image",file);
    const res=await fetch("http://localhost:4000/products/upload",{method:"POST",body:formData});
    const data=await res.json();
    setForm({...form,imageUrl:data.url});
  };

  return (
    <div className="product-management">
      <h2>{editId?"Edit Product":"Add Product"}</h2>
      <form className="product-form" onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/>
        <input type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:Number(e.target.value)})}/>
        <input type="file" onChange={handleImage}/>
        <button type="submit" disabled={loading}>{loading? "Saving...": editId?"Update":"Add"}</button>
      </form>
      <div className="product-list">
        {products.length===0?<p>No products found</p>:products.map(p=>(
          <div key={p.id} className="product-item">
            <span>{p.name} - ₹{p.price} ({p.stock} in stock)</span>
            <div>
              <button className="edit" onClick={()=>handleEdit(p)}>Edit</button>
              <button className="delete" onClick={()=>handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
