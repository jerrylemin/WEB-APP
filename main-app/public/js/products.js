async function switchPage(currPage) {
    createPagination();
    try {
        const response = await fetch(`https://localhost:5000/products/page/${currPage}`);
        const products = await response.json();
        const container = document.querySelector(".items");
        container.innerHTML = "";
        products.forEach((p) => {
            container.innerHTML += `
                <div data-product-id="${p._id}" class="productCard group bg-yellow/50 border border-yellow/50 rounded-outer p-1 backdrop-blur-lg flex flex-col justify-between transition-transform transition-shadow duration-200 hover:shadow-lg hover:scale-110 relative">
                    <div class="absolute inset-0 pointer-events-none tr  ansition-opacity opacity-0 group-hover:opacity-100 duration-200 from-yellow/20 to-white/20"></div>
                    <div class="info h-3/4">
                        <img class="w-full rounded-inner aspect-square" src="/${p.image}" alt="">
                        <p class="font-bold font-serif text-medium">${p.name}</p>
                        <p class="font-serif text-medium">${p.price}đ</p>
                    </div>
                    <div class="flex justify-center cursor-pointer">
                        <div class="bttn rounded-full bg-red w-[40px] h-[40px] flex justify-center items-center">
                            <i class="fa-solid fa-plus text-white"></i>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    catch(err) {
        console.log(err);
    }
}

function createPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = ""; // Reset nội dung cũ
    const ul = document.createElement("ul");
    ul.classList.add("pagination");

    // Tạo nút Previous
    const prev = document.createElement("li");
    prev.textContent = "Previous";
    if(currPage === 1) {
        prev.classList.add("disabled");
    }
    prev.onclick = () => {
        if (currPage > 1) {
            currPage--;
            switchPage(currPage);
        }
    };
    ul.appendChild(prev);

    // Tính toán nút chuyển trang min và nút chuyển trang max
    const startPage = Math.max(1, currPage - 2);
    const endPage = Math.min(totalPages, currPage + 2);
    
    // Nếu nút chuyển trang bắt đầu từ 1 thì không cần thêm vào ... ở trước đó nữa
    if(startPage !== 1) {
        const manyPrev = document.createElement("li");
        manyPrev.textContent = "…";
        manyPrev.classList.add("disabled");
        ul.appendChild(manyPrev);
    }
    
    // Hiển thị 2 nút bên trái và 2 nút bên phải
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.textContent = i;

        if (i === currPage) {
            li.classList.add("active");
        } else {
            li.onclick = () => {
                currPage = i;
                switchPage(currPage);
            };
        }
        ul.appendChild(li);
    }

    // Nếu nút chuyển trang kết thúc bằng totalPages thì không cần thêm vào ... ở sau đó nữa
    if(endPage !== totalPages) {
        const manyNext = document.createElement("li");
        manyNext.textContent = "…";
        manyNext.classList.add("disabled");
        ul.appendChild(manyNext);
    }

    // Tạo nút Next
    const next = document.createElement("li");
    next.textContent = "Next";
    if(currPage === totalPages) {
        next.classList.add("disabled");
    }
    next.onclick = () => {
        if (currPage < totalPages) {
            currPage++;
            switchPage(currPage);
        };
    };
    ul.appendChild(next);

    // Thêm vào DOM
    pagination.appendChild(ul);
}

// Khởi tạo thanh pagination
createPagination();
switchPage(currPage).then(() => {
    const bttns = document.querySelectorAll(".bttn");
    bttns.forEach(async (bttn) => {
        bttn.addEventListener("click", async (e) => {
            e.preventDefault();
            const productId = bttn.parentNode.parentNode.getAttribute("data-product-id");
            try {
                const res = await fetch(`/cart/add/${productId}`, { method: 'POST' });          
                const noti = await res.text();
                showNotification(noti);
            } 
            catch(e) {
                console.log(e);
            }
        });
    });

    document.querySelectorAll(".productCard").forEach((parent) => {
        parent.addEventListener("click", async (e) => {
            if(!e.target.classList.contains("bttn")) {
                try {
                    const prod = await fetch(`https://localhost:5000/products/id/${parent.getAttribute("data-product-id")}`);
                    const res = await prod.json();
                    document.querySelector(".full-info-cnt").innerHTML = `
                        <h1 class="text-center text-big text-red font-serif font-bold">${res.name}</h1>
                        <div class="flex justify-center m-4">
                            <img class="rounded-inner aspect-square w-1/2" src="/${res.image}" alt="">
                        </div>
                        <p class="text-medium font-serif"><b>Mô tả</b>: ${res.description}</p>
                        <p class="text-medium font-serif"><b>Phân loại</b>: ${res.category}</p>
                        <p class="text-medium font-serif"><b>Kho</b>: ${res.stock}</p>
                        <p class="text-medium font-serif"><b>Giá</b>: ${res.price}đ</p>
                    `;
                    document.querySelector(".full-info").classList.toggle("hidden");
                }
                catch(e) {
                    console.log(e);
                }
            }
        });
    });
});

document.querySelector(".full-info").addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("hidden");
});