**DANH SÁCH CÁC GÓI NPM CẦN THIẾT CHO ỨNG DỤNG WEB NODE.JS VỚI EXPRESS, MONGODB VÀ EJS**

---

Chào bạn,

Để triển khai các chức năng quản trị đầy đủ trong ứng dụng web Node.js sử dụng Express, MongoDB, và EJS như đã thảo luận, bạn sẽ cần cài đặt một số gói npm (Node Package Manager) cần thiết. Dưới đây là danh sách các gói npm mà bạn cần **cài đặt** cùng với một số gợi ý về cách sử dụng chúng.

---

## **1. Gói Cơ Bản (Dependencies)**

Đây là các gói cần thiết để xây dựng và vận hành ứng dụng của bạn:

1. **express**  
   *Framework web nhanh và linh hoạt cho Node.js.*

   ```bash
   npm install express
   ```

2. **ejs**  
   *View engine cho Express, hỗ trợ template HTML với JavaScript.*

   ```bash
   npm install ejs
   ```

3. **mongoose**  
   *ODM (Object Data Modeling) cho MongoDB và Node.js.*

   ```bash
   npm install mongoose
   ```

4. **passport**  
   *Middleware xác thực cho Node.js.*

   ```bash
   npm install passport
   ```

5. **passport-local**  
   *Chiến lược Passport cho xác thực bằng email và mật khẩu.*

   ```bash
   npm install passport-local
   ```

6. **express-session**  
   *Middleware để quản lý session trong Express.*

   ```bash
   npm install express-session
   ```

7. **connect-mongo**  
   *Lưu trữ session Express trong MongoDB.*

   ```bash
   npm install connect-mongo
   ```

8. **bcryptjs**  
   *Thư viện để mã hóa mật khẩu.*

   ```bash
   npm install bcryptjs
   ```

9. **connect-flash**  
   *Middleware để truyền thông điệp flash giữa các request.*

   ```bash
   npm install connect-flash
   ```

10. **method-override**  
    *Middleware để sử dụng các phương thức HTTP khác như PUT hoặc DELETE trong form.*

    ```bash
    npm install method-override
    ```

11. **dotenv**  
    *Thư viện để quản lý biến môi trường từ tệp `.env`.*

    ```bash
    npm install dotenv
    ```

12. **helmet**  
    *Bộ bảo mật middleware giúp bảo vệ ứng dụng khỏi một số lỗ hổng web phổ biến.*

    ```bash
    npm install helmet
    ```

13. **winston**  
    *Thư viện ghi log linh hoạt và đa năng cho Node.js.*

    ```bash
    npm install winston
    ```

6. **passport-google-oauth20**  
    *Chiến lược Passport cho xác thực bằng Google OAuth.*

    ```bash
    npm install passport-google-oauth20
    ```
---

## **2. Gói Phụ Thuộc (Dev Dependencies)**

Các gói này hỗ trợ trong quá trình phát triển nhưng không cần thiết cho môi trường sản xuất:

1. **nodemon**  
   *Công cụ phát triển giúp tự động khởi động lại ứng dụng khi có thay đổi trong mã nguồn.*

   ```bash
   npm install nodemon --save-dev
   ```

2. **eslint** *(Tùy chọn)*  
   *Công cụ kiểm tra mã nguồn để đảm bảo chất lượng và tuân thủ các quy tắc.*

   ```bash
   npm install eslint --save-dev
   ```

3. **morgan** *(Tùy chọn)*  
   *Middleware HTTP request logger cho Node.js.*

   ```bash
   npm install morgan --save-dev
   ```

4. **nodemailer** *(Nếu cần gửi email từ server)*  
   *Thư viện để gửi email từ Node.js.*

   ```bash
   npm install nodemailer --save-dev
   ```

5. **concurrently**
   *Công cụ chạy nhiều lệnh shell cùng lúc.*

   ```bash
   npm install concurrently --save-dev
   ```

6. **cross-env**  
   *Gói giúp chạy lệnh shell với các biến môi trường được định nghĩa rõ ràng, hỗ trợ cả Windows, macOS và Linux.*

   ```bash
   npm install cross-env
   ```
---

## **3. Các Gói Tùy Chọn Khác**

Tùy thuộc vào nhu cầu cụ thể của ứng dụng, bạn có thể cân nhắc thêm các gói sau:

1. **express-validator**  
   *Thư viện để kiểm tra và xác thực dữ liệu đầu vào từ người dùng.*

   ```bash
   npm install express-validator
   ```

2. **csurf**  
   *Middleware để bảo vệ ứng dụng khỏi các cuộc tấn công CSRF (Cross-Site Request Forgery).*

   ```bash
   npm install csurf
   ```

3. **multer** *(Nếu cần xử lý tải lên tệp tin)*  
   *Middleware để xử lý multipart/form-data, chủ yếu là để tải lên tệp tin.*

   ```bash
   npm install multer
   ```

4. **cors** *(Nếu ứng dụng của bạn cần hỗ trợ CORS)*  
   *Middleware để bật CORS (Cross-Origin Resource Sharing).*

   ```bash
   npm install cors
   ```

---

## **4. Tổng Hợp Lệnh Cài Đặt**

Bạn có thể cài đặt tất cả các gói trên bằng cách chạy các lệnh sau trong terminal tại thư mục dự án của bạn:

```bash
# Cài đặt các gói cơ bản
npm install express ejs mongoose passport passport-local express-session connect-mongo bcryptjs connect-flash method-override dotenv helmet winston

# Cài đặt các gói phụ thuộc trong quá trình phát triển
npm install nodemon eslint morgan --save-dev

# Cài đặt các gói tùy chọn nếu cần
npm install express-validator csurf multer cors
```

---

## **6. Các Bước Tiếp Theo Sau Khi Cài Đặt Gói**

3. **Cấu Hình Helmet và Các Middleware Bảo Mật Khác:**  
   Đảm bảo rằng các middleware như Helmet, CORS (nếu sử dụng), và CSRF được cấu hình đúng cách để bảo vệ ứng dụng.

4. **Thiết Lập Winston để Ghi Log:**  
   Tạo tệp `logger.js` để cấu hình Winston và sử dụng nó trong các controller để ghi log.

5. **Kiểm Tra Ứng Dụng:**  
   Sau khi cài đặt và cấu hình các gói, hãy chạy ứng dụng trong chế độ phát triển để kiểm tra.

   ```bash
   npm run dev
   ```

6. **Triển Khai Các Chức Năng Quản Trị:**  
   Tiếp tục phát triển các chức năng quản trị như quản lý người dùng, sản phẩm, đơn hàng, danh mục, và các nội dung khác theo hướng dẫn trước đó.

---

## **7. Lời Khuyên Khi Làm Việc Với Các Gói NPM**

- **Luôn Đọc Tài Liệu:**  
  Mỗi gói npm đều có tài liệu riêng. Hãy tham khảo tài liệu chính thức để hiểu cách sử dụng và cấu hình chúng một cách hiệu quả.

- **Cập Nhật Gói Định Kỳ:**  
  Đảm bảo rằng bạn thường xuyên cập nhật các gói npm để nhận được các bản vá lỗi và cải tiến mới nhất.

  ```bash
  npm update
  ```
