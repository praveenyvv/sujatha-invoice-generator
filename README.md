# A. Sujatha - Transport Invoice Generator

A custom, fast web application designed specifically for **A. Sujatha (Fleet Owners & Transport Contractors)** to generate, preview, print, and download exact transportation and container bills in seconds.

---

## 🚀 How to Run the Website

### Method 1 (Quick Double-Click):
Double-click the **[`start_app.bat`](file:///c:/Users/prave/CS/Personal%20projects/Sujatha%20invoice%20generator/start_app.bat)** file. It will automatically start the server and open the app in your default browser at `http://localhost:8080/index.html`.

### Method 2 (Direct File):
You can also directly double-click **[`index.html`](file:///c:/Users/prave/CS/Personal%20projects/Sujatha%20invoice%20generator/index.html)** in any web browser (Chrome, Edge, Firefox, Brave).

---

## ✨ Key Features

1. **Two Formats with 1-Click Toggle**:
   * **Standard Transport Bill**: For bulk goods, ton bags, loose trips with optional **Weighment Charges** at the bottom.
   * **Container Shipping Bill**: Automatically adds the **Container No** and **Size** (e.g. `20'`, `40'`) columns.

2. **1-Click Customer Auto-Fill**:
   * Pre-configured with **M/S Dara Minerals Pvt Ltd** and **M/S Shirdi Sai Shipping Pvt Ltd**.
   * Selecting a customer automatically populates the Address, GST number, bill prefix, and default subject.
   * **Save New Customers**: Type a new customer's info and click **💾 Save** to save them to your quick-select dropdown.

3. **Automatic Calculations & Amount in Words**:
   * Subtotals, weighment charges, and grand totals are calculated live.
   * Converts numbers directly into standard Indian wording (e.g., `₹9,700` $\rightarrow$ *"Nine Thousand Seven Hundred Rupees Only"*).

4. **Authentic Letterhead & Rubber Stamp**:
   * Clean, high-resolution header banner and official round seal/signature stamp are integrated.
   * Checkbox to toggle the stamp or bank details on/off anytime.

5. **Instant PDF Download & Print**:
   * **🖨️ Print / Save as PDF**: Formatted with `@media print` rules for A4 paper.
   * **📥 Direct PDF Download**: Uses bundled local `html2pdf.bundle.min.js` to download a `.pdf` directly with no internet needed.
