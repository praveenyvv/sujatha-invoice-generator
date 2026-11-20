/**
 * A. SUJATHA - BILL GENERATOR (FRESH / UNFILLED STATE)
 */

// Application State - 100% Fresh
const state = {
  billType: 'standard', // 'standard' | 'container'
  customer: {
    name: '',
    address: '',
    gst: ''
  },
  billNo: '',
  billDate: getTodayISODate(), // Defaults to Today automatically
  subject: '',
  items: [
    {
      date: getTodayISODate(), // Defaults to Today
      vehicleNo: '',
      from: '',
      to: '',
      containerNo: '',
      size: "20'",
      amount: ''
    }
  ],
  enableWeighment: false,
  weighmentCharges: '',
  showStamp: true,
  showBankDetails: true
};

// =============================================================================
// INDIAN NUMBER TO WORDS CONVERTER
// =============================================================================
function numberToIndianWords(num) {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertBelowThousand(val) {
    let str = '';
    if (val >= 100) {
      str += ones[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 20) {
      str += tens[Math.floor(val / 10)] + ' ';
      val %= 10;
    }
    if (val > 0) {
      str += ones[val] + ' ';
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  if (crore > 0) words += convertBelowThousand(crore) + ' Crore ';
  if (lakh > 0) words += convertBelowThousand(lakh) + ' Lakh ';
  if (thousand > 0) words += convertBelowThousand(thousand) + ' Thousand ';
  if (remainder > 0) words += convertBelowThousand(remainder) + ' ';

  return (words.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

// Format numbers with Indian commas (e.g. 9,500)
function formatIndianCurrency(num) {
  const val = Number(num) || 0;
  return val.toLocaleString('en-IN');
}

// Format ISO date (YYYY-MM-DD) to Display date (DD/MM/YYYY or DD.MM.YYYY)
function formatDateForBill(dateStr, separator = '/') {
  if (!dateStr) return '';
  if (dateStr.includes('.') || dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}${separator}${parts[1]}${separator}${parts[0]}`;
  }
  return dateStr;
}

// =============================================================================
// DOM ELEMENTS CACHE
// =============================================================================
const dom = {
  // Inputs
  billTypeRadios: document.querySelectorAll('input[name="billType"]'),
  customerName: document.getElementById('customerName'),
  customerAddress: document.getElementById('customerAddress'),
  customerGST: document.getElementById('customerGST'),
  billNo: document.getElementById('billNo'),
  billDate: document.getElementById('billDate'),
  billSubject: document.getElementById('billSubject'),
  itemsContainer: document.getElementById('itemsContainer'),
  btnAddRow: document.getElementById('btnAddRow'),
  standardChargesGroup: document.getElementById('standardChargesGroup'),
  enableWeighment: document.getElementById('enableWeighment'),
  weighmentInputWrapper: document.getElementById('weighmentInputWrapper'),
  weighmentCharges: document.getElementById('weighmentCharges'),
  showStamp: document.getElementById('showStamp'),
  showBankDetails: document.getElementById('showBankDetails'),

  // Quick Action Buttons
  btnSampleDara: document.getElementById('btnSampleDara'),
  btnSampleShirdi: document.getElementById('btnSampleShirdi'),
  btnNewInvoice: document.getElementById('btnNewInvoice'),
  btnDownloadPDF: document.getElementById('btnDownloadPDF'),

  // In-form Summary Elements
  formSubtotal: document.getElementById('formSubtotal'),
  formWeighment: document.getElementById('formWeighment'),
  formGrandTotal: document.getElementById('formGrandTotal'),
  formAmountInWords: document.getElementById('formAmountInWords'),
  dockTotalAmount: document.getElementById('dockTotalAmount'),
  weighmentLine: document.getElementById('weighmentLine'),

  // Modal Preview Elements
  btnPreviewModal: document.getElementById('btnPreviewModal'),
  previewModal: document.getElementById('previewModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnModalZoom: document.getElementById('btnModalZoom'),
  btnModalDownload: document.getElementById('btnModalDownload'),
  modalSheetScroll: document.getElementById('modalSheetScroll'),

  // Offscreen Print & PDF Invoice Paper
  invoiceRenderWrapper: document.getElementById('invoiceRenderWrapper'),
  invoicePaper: document.getElementById('invoicePaper'),
  outBillNo: document.getElementById('outBillNo'),
  outBillDate: document.getElementById('outBillDate'),
  outCustomerName: document.getElementById('outCustomerName'),
  outCustomerAddress: document.getElementById('outCustomerAddress'),
  outCustomerGST: document.getElementById('outCustomerGST'),
  outSubjectBlock: document.getElementById('outSubjectBlock'),
  outSubject: document.getElementById('outSubject'),
  outTableHead: document.getElementById('outTableHead'),
  outTableBody: document.getElementById('outTableBody'),
  outStandardTotals: document.getElementById('outStandardTotals'),
  outSubtotal: document.getElementById('outSubtotal'),
  outWeighmentRow: document.getElementById('outWeighmentRow'),
  outWeighment: document.getElementById('outWeighment'),
  outGrandTotal: document.getElementById('outGrandTotal'),
  outAmountInWords: document.getElementById('outAmountInWords'),
  outBankBox: document.getElementById('outBankBox'),
  outStampBox: document.getElementById('outStampBox')
};

// =============================================================================
// INITIALIZATION & EVENT LISTENERS
// =============================================================================
function init() {
  syncFormFromState();
  renderItemsEditor();
  updateCalculationsAndPrintPaper();
  setupEventListeners();
}

function setupEventListeners() {
  // Bill Type change
  dom.billTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.billType = e.target.value;
      if (state.billType === 'container') {
        dom.standardChargesGroup.style.display = 'none';
        dom.weighmentLine.style.display = 'none';
      } else {
        dom.standardChargesGroup.style.display = 'block';
        dom.weighmentLine.style.display = state.enableWeighment ? 'flex' : 'none';
      }
      renderItemsEditor();
      updateCalculationsAndPrintPaper();
    });
  });

  // Form input changes
  dom.customerName.addEventListener('input', (e) => {
    state.customer.name = e.target.value;
    updateCalculationsAndPrintPaper();
  });
  dom.customerAddress.addEventListener('input', (e) => {
    state.customer.address = e.target.value;
    updateCalculationsAndPrintPaper();
  });
  dom.customerGST.addEventListener('input', (e) => {
    state.customer.gst = e.target.value;
    updateCalculationsAndPrintPaper();
  });
  dom.billNo.addEventListener('input', (e) => {
    state.billNo = e.target.value;
    updateCalculationsAndPrintPaper();
  });
  dom.billDate.addEventListener('change', (e) => {
    state.billDate = e.target.value;
    updateCalculationsAndPrintPaper();
  });
  dom.billSubject.addEventListener('input', (e) => {
    state.subject = e.target.value;
    updateCalculationsAndPrintPaper();
  });

  // Weighment charges toggle
  dom.enableWeighment.addEventListener('change', (e) => {
    state.enableWeighment = e.target.checked;
    dom.weighmentInputWrapper.style.display = state.enableWeighment ? 'block' : 'none';
    dom.weighmentLine.style.display = state.enableWeighment ? 'flex' : 'none';
    updateCalculationsAndPrintPaper();
  });
  dom.weighmentCharges.addEventListener('input', (e) => {
    state.weighmentCharges = e.target.value;
    updateCalculationsAndPrintPaper();
  });

  // Stamp and Bank toggles
  dom.showStamp.addEventListener('change', (e) => {
    state.showStamp = e.target.checked;
    updateCalculationsAndPrintPaper();
  });
  dom.showBankDetails.addEventListener('change', (e) => {
    state.showBankDetails = e.target.checked;
    updateCalculationsAndPrintPaper();
  });

  // Add Item Row
  dom.btnAddRow.addEventListener('click', () => {
    state.items.push({
      date: getTodayISODate(),
      vehicleNo: '',
      from: '',
      to: '',
      containerNo: '',
      size: "20'",
      amount: ''
    });
    renderItemsEditor();
    updateCalculationsAndPrintPaper();
  });

  // Samples & Clear
  if (dom.btnSampleDara) dom.btnSampleDara.addEventListener('click', loadSampleDara);
  if (dom.btnSampleShirdi) dom.btnSampleShirdi.addEventListener('click', loadSampleShirdi);
  if (dom.btnNewInvoice) dom.btnNewInvoice.addEventListener('click', resetNewInvoice);

  // PDF Downloads (Direct 1-page download)
  if (dom.btnDownloadPDF) dom.btnDownloadPDF.addEventListener('click', downloadPDF);
  if (dom.btnModalDownload) dom.btnModalDownload.addEventListener('click', downloadPDF);

  // Modal Preview & Zoom
  if (dom.btnPreviewModal) dom.btnPreviewModal.addEventListener('click', openPreviewModal);
  if (dom.btnCloseModal) dom.btnCloseModal.addEventListener('click', closePreviewModal);
  if (dom.btnModalZoom) dom.btnModalZoom.addEventListener('click', toggleModalZoom);
  if (dom.previewModal) {
    dom.previewModal.addEventListener('click', (e) => {
      if (e.target === dom.previewModal) closePreviewModal();
    });
  }

  // Handle window resizing for responsive preview scaling
  window.addEventListener('resize', () => {
    if (dom.previewModal && dom.previewModal.classList.contains('active') && !isZoomed100) {
      renderScaledPreview();
    }
  });
}

// =============================================================================
// STATE & FORM SYNC
// =============================================================================
function setBillTypeRadio(type) {
  dom.billTypeRadios.forEach(r => {
    r.checked = (r.value === type);
  });
  dom.standardChargesGroup.style.display = (type === 'container') ? 'none' : 'block';
  dom.weighmentLine.style.display = (type === 'container' || !state.enableWeighment) ? 'none' : 'flex';
}

function syncFormFromState() {
  setBillTypeRadio(state.billType);
  dom.customerName.value = state.customer.name;
  dom.customerAddress.value = state.customer.address;
  dom.customerGST.value = state.customer.gst;
  dom.billNo.value = state.billNo;
  dom.billDate.value = state.billDate;
  dom.billSubject.value = state.subject;
  dom.enableWeighment.checked = state.enableWeighment;
  dom.weighmentCharges.value = state.weighmentCharges;
  dom.weighmentInputWrapper.style.display = state.enableWeighment ? 'block' : 'none';
  dom.showStamp.checked = state.showStamp;
  dom.showBankDetails.checked = state.showBankDetails;
}

// =============================================================================
// DYNAMIC ITEMS EDITOR (MOBILE-FRIENDLY WITH DATE PICKER)
// =============================================================================
function renderItemsEditor() {
  dom.itemsContainer.innerHTML = '';
  const isContainer = (state.billType === 'container');

  state.items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.innerHTML = `
      <div class="trip-card-header">
        <span>Trip #${index + 1}</span>
        ${state.items.length > 1 ? `<button type="button" class="btn-remove-trip" data-index="${index}" title="Remove Trip">✕ Remove</button>` : ''}
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Trip Date (Pick Date)</label>
          <input type="date" class="form-control item-date" data-index="${index}" value="${item.date}">
        </div>
        <div class="form-group">
          <label>Vehicle No</label>
          <input type="text" class="form-control item-vehicle" data-index="${index}" value="${item.vehicleNo}" placeholder="e.g. AP39TA2862">
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>From (Origin)</label>
          <input type="text" class="form-control item-from" data-index="${index}" value="${item.from}" placeholder="e.g. Aganampudi">
        </div>
        <div class="form-group">
          <label>To (Destination)</label>
          <input type="text" class="form-control item-to" data-index="${index}" value="${item.to}" placeholder="e.g. Cwc cfs">
        </div>
      </div>
      ${isContainer ? `
      <div class="form-grid-2">
        <div class="form-group">
          <label>Container No</label>
          <input type="text" class="form-control item-container" data-index="${index}" value="${item.containerNo || ''}" placeholder="e.g. MEDU 6967921">
        </div>
        <div class="form-group">
          <label>Size</label>
          <input type="text" class="form-control item-size" data-index="${index}" value="${item.size || "20'"}" placeholder="20'">
        </div>
      </div>
      ` : ''}
      <div class="form-group">
        <label>Amount / Rate (₹) <span class="req">*</span></label>
        <input type="number" class="form-control item-amount" data-index="${index}" value="${item.amount}" placeholder="e.g. 9500">
      </div>
    `;
    dom.itemsContainer.appendChild(card);
  });

  // Attach event listeners for dynamic inputs
  dom.itemsContainer.querySelectorAll('.btn-remove-trip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-index'));
      state.items.splice(idx, 1);
      renderItemsEditor();
      updateCalculationsAndPrintPaper();
    });
  });

  dom.itemsContainer.querySelectorAll('.item-date').forEach(inp => {
    inp.addEventListener('change', (e) => {
      state.items[Number(e.target.dataset.index)].date = e.target.value;
      updateCalculationsAndPrintPaper();
    });
  });

  dom.itemsContainer.querySelectorAll('.item-vehicle').forEach(inp => {
    inp.addEventListener('input', (e) => {
      state.items[Number(e.target.dataset.index)].vehicleNo = e.target.value;
      updateCalculationsAndPrintPaper();
    });
  });

  dom.itemsContainer.querySelectorAll('.item-from').forEach(inp => {
    inp.addEventListener('input', (e) => {
      state.items[Number(e.target.dataset.index)].from = e.target.value;
      updateCalculationsAndPrintPaper();
    });
  });

  dom.itemsContainer.querySelectorAll('.item-to').forEach(inp => {
    inp.addEventListener('input', (e) => {
      state.items[Number(e.target.dataset.index)].to = e.target.value;
      updateCalculationsAndPrintPaper();
    });
  });

  if (isContainer) {
    dom.itemsContainer.querySelectorAll('.item-container').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.items[Number(e.target.dataset.index)].containerNo = e.target.value;
        updateCalculationsAndPrintPaper();
      });
    });

    dom.itemsContainer.querySelectorAll('.item-size').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.items[Number(e.target.dataset.index)].size = e.target.value;
        updateCalculationsAndPrintPaper();
      });
    });
  }

  dom.itemsContainer.querySelectorAll('.item-amount').forEach(inp => {
    inp.addEventListener('input', (e) => {
      state.items[Number(e.target.dataset.index)].amount = e.target.value;
      updateCalculationsAndPrintPaper();
    });
  });
}

// =============================================================================
// CALCULATIONS & PRINT PAPER SYNC
// =============================================================================
function updateCalculationsAndPrintPaper() {
  const isContainer = (state.billType === 'container');
  let itemsSubtotal = 0;

  state.items.forEach(it => {
    itemsSubtotal += Number(it.amount) || 0;
  });

  let grandTotal = itemsSubtotal;
  let weighmentAmt = 0;

  if (!isContainer && state.enableWeighment) {
    weighmentAmt = Number(state.weighmentCharges) || 0;
    grandTotal += weighmentAmt;
  }

  const words = grandTotal > 0 ? numberToIndianWords(grandTotal) : 'Zero Rupees Only';

  // 1. Update in-form summary card & sticky action dock
  dom.formSubtotal.textContent = `₹${formatIndianCurrency(itemsSubtotal)}`;
  dom.formWeighment.textContent = `₹${formatIndianCurrency(weighmentAmt)}`;
  dom.formGrandTotal.textContent = `₹${formatIndianCurrency(grandTotal)}`;
  dom.dockTotalAmount.textContent = `₹${formatIndianCurrency(grandTotal)}`;
  dom.formAmountInWords.textContent = words;

  // 2. Update print paper template
  dom.outBillNo.textContent = state.billNo || '---';
  dom.outBillDate.textContent = formatDateForBill(state.billDate, '.') || '---';
  dom.outCustomerName.textContent = state.customer.name || '';
  dom.outCustomerAddress.innerHTML = (state.customer.address || '').replace(/\n/g, '<br>');
  dom.outCustomerGST.textContent = state.customer.gst ? `GST NO: ${state.customer.gst}` : '';
  
  if (state.subject) {
    dom.outSubjectBlock.style.display = 'block';
    dom.outSubject.textContent = state.subject;
  } else {
    dom.outSubjectBlock.style.display = 'none';
  }

  if (isContainer) {
    dom.outTableHead.innerHTML = `
      <tr>
        <th style="width: 6%;">S NO</th>
        <th style="width: 14%;">DATE</th>
        <th style="width: 16%;">VECHILE NO</th>
        <th style="width: 13%;">FROM</th>
        <th style="width: 13%;">TO</th>
        <th style="width: 18%;">CONTAINER NO</th>
        <th style="width: 8%;">SIZE</th>
        <th style="width: 12%;">WEIGHMENT</th>
      </tr>
    `;

    let rowsHTML = '';
    state.items.forEach((item, i) => {
      const amt = Number(item.amount) || 0;
      rowsHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${formatDateForBill(item.date, '/')}</td>
          <td>${item.vehicleNo || ''}</td>
          <td>${item.from || ''}</td>
          <td>${item.to || ''}</td>
          <td>${item.containerNo || ''}</td>
          <td>${item.size || ''}</td>
          <td>${amt > 0 ? formatIndianCurrency(amt) : ''}</td>
        </tr>
      `;
    });

    rowsHTML += `
      <tr class="total-row">
        <td colspan="7" style="text-align: right; font-weight: bold; padding-right: 20px;">TOTAL AMOUNT</td>
        <td style="font-weight: bold;">${formatIndianCurrency(grandTotal)}</td>
      </tr>
    `;

    dom.outTableBody.innerHTML = rowsHTML;
    dom.outStandardTotals.style.display = 'none';

  } else {
    dom.outTableHead.innerHTML = `
      <tr>
        <th style="width: 8%;">S NO</th>
        <th style="width: 18%;">DATE</th>
        <th style="width: 24%;">VEHICLE NO</th>
        <th style="width: 22%;">FROM</th>
        <th style="width: 14%;">TO</th>
        <th style="width: 14%;">AMOUNT</th>
      </tr>
    `;

    let rowsHTML = '';
    state.items.forEach((item, i) => {
      const amt = Number(item.amount) || 0;
      rowsHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${formatDateForBill(item.date, '/')}</td>
          <td>${item.vehicleNo || ''}</td>
          <td>${item.from || ''}</td>
          <td>${item.to || ''}</td>
          <td>${amt > 0 ? formatIndianCurrency(amt) : ''}</td>
        </tr>
      `;
    });

    dom.outTableBody.innerHTML = rowsHTML;
    dom.outStandardTotals.style.display = 'flex';

    dom.outSubtotal.textContent = `${formatIndianCurrency(itemsSubtotal)} /-`;
    if (state.enableWeighment && weighmentAmt > 0) {
      dom.outWeighmentRow.style.display = 'flex';
      dom.outWeighment.textContent = `${formatIndianCurrency(weighmentAmt)} /-`;
    } else {
      dom.outWeighmentRow.style.display = 'none';
    }
    dom.outGrandTotal.textContent = `${formatIndianCurrency(grandTotal)} /-`;
  }

  dom.outAmountInWords.textContent = words;
  dom.outStampBox.style.display = state.showStamp ? 'flex' : 'none';
  dom.outBankBox.style.display = state.showBankDetails ? 'block' : 'none';
}

// =============================================================================
// MODAL PREVIEW (PROPORTIONALLY SCALED A4 ORIGINAL WITH ZERO COLUMN WRAPPING)
// =============================================================================
let isZoomed100 = false;

function openPreviewModal() {
  updateCalculationsAndPrintPaper();
  isZoomed100 = false;
  if (dom.btnModalZoom) dom.btnModalZoom.textContent = '🔍 Zoom 100%';
  renderScaledPreview();
  dom.previewModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function toggleModalZoom() {
  isZoomed100 = !isZoomed100;
  if (dom.btnModalZoom) {
    dom.btnModalZoom.textContent = isZoomed100 ? '🔍 Fit Screen' : '🔍 Zoom 100%';
  }
  renderScaledPreview();
}

function renderScaledPreview() {
  if (!dom.modalSheetScroll || !dom.invoicePaper) return;

  const clone = dom.invoicePaper.cloneNode(true);
  clone.id = 'previewClonePaper';

  dom.modalSheetScroll.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'modal-preview-viewport';

  const scaleWrapper = document.createElement('div');
  scaleWrapper.className = 'preview-scale-wrapper';
  scaleWrapper.appendChild(clone);

  if (isZoomed100) {
    scaleWrapper.style.transform = 'none';
    scaleWrapper.style.margin = '0 auto';
    viewport.style.height = 'auto';
  } else {
    // Determine available width
    const scrollWidth = dom.modalSheetScroll.clientWidth || window.innerWidth;
    const targetWidth = Math.max(scrollWidth - 28, 280);
    const scale = Math.min(targetWidth / 794, 1);

    scaleWrapper.style.transform = `scale(${scale})`;
    scaleWrapper.style.transformOrigin = 'top center';

    const naturalHeight = dom.invoicePaper.offsetHeight || 880;
    viewport.style.height = `${Math.ceil(naturalHeight * scale) + 24}px`;
  }

  viewport.appendChild(scaleWrapper);
  dom.modalSheetScroll.appendChild(viewport);
}

function closePreviewModal() {
  dom.previewModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// =============================================================================
// DIRECT 1-PAGE PDF DOWNLOAD (NEVER BLANK, EXACT DESKTOP/PRINT FIDELITY)
// =============================================================================
async function downloadPDF() {
  updateCalculationsAndPrintPaper();

  const rawBillNo = state.billNo || 'Sujatha_Bill';
  const cleanName = rawBillNo.replace(/[/\\?%*:|"<> ]/g, '_');
  const filename = `${cleanName}.pdf`;

  const btnDock = dom.btnDownloadPDF;
  const btnModal = dom.btnModalDownload;
  const dockOriginal = btnDock ? btnDock.innerHTML : '';
  const modalOriginal = btnModal ? btnModal.innerHTML : '';

  if (btnDock) {
    btnDock.disabled = true;
    btnDock.innerHTML = '⏳ Generating PDF...';
  }
  if (btnModal) {
    btnModal.disabled = true;
    btnModal.innerHTML = '⏳ Generating PDF...';
  }

  const wrapper = dom.invoiceRenderWrapper;
  const paper = dom.invoicePaper;

  // Temporarily bring the wrapper into fixed view at top: 0, left: 0 with z-index: 999999
  // so html2canvas renders 100% fully visible, opaque, non-blank canvas
  const prevPosition = wrapper.style.position;
  const prevZIndex = wrapper.style.zIndex;
  const prevTop = wrapper.style.top;
  const prevLeft = wrapper.style.left;
  const prevOpacity = wrapper.style.opacity;
  const prevVisibility = wrapper.style.visibility;

  wrapper.style.position = 'fixed';
  wrapper.style.top = '0px';
  wrapper.style.left = '0px';
  wrapper.style.zIndex = '999999';
  wrapper.style.opacity = '1';
  wrapper.style.visibility = 'visible';
  wrapper.style.pointerEvents = 'none';

  try {
    // Ensure all images (letterhead, stamp) are fully loaded
    const imgs = Array.from(paper.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all'] }
      };

      await html2pdf()
        .set(opt)
        .from(paper)
        .toPdf()
        .get('pdf')
        .then(function(pdf) {
          // Guarantee strictly 1 single A4 page
          const totalPages = pdf.internal.getNumberOfPages();
          if (totalPages > 1) {
            for (let i = totalPages; i > 1; i--) {
              pdf.deletePage(i);
            }
          }
        })
        .save();
    } else {
      window.print();
    }
  } catch (err) {
    console.error('PDF Download failed:', err);
    alert('Direct PDF generation encountered an issue. Opening standard print/save dialog.');
    window.print();
  } finally {
    // Restore offscreen styling
    wrapper.style.position = prevPosition;
    wrapper.style.zIndex = prevZIndex;
    wrapper.style.top = prevTop;
    wrapper.style.left = prevLeft;
    wrapper.style.opacity = prevOpacity;
    wrapper.style.visibility = prevVisibility;

    if (btnDock) {
      btnDock.disabled = false;
      btnDock.innerHTML = dockOriginal;
    }
    if (btnModal) {
      btnModal.disabled = false;
      btnModal.innerHTML = modalOriginal;
    }
  }
}

// =============================================================================
// TEST SAMPLES & CLEAR
// =============================================================================
function loadSampleDara() {
  state.billType = 'standard';
  state.customer = {
    name: 'M/S DARA MINERALS PRIVATE LIMITED',
    address: 'Plot No. 74, Road No.2,APIIC IALA,\nAganampudi ,Visakhapatnam,\nAndhraPradesh – 530053.',
    gst: '37AAMCD0296Q1ZV'
  };
  state.billNo = '07/DM-SSVLT/(2026-2027)';
  state.billDate = getTodayISODate();
  state.subject = 'submission of transportation bill (Loading from Aganampudi to Cwc cfs Ton Bags)';
  state.items = [
    {
      date: getTodayISODate(),
      vehicleNo: 'AP39TA2862',
      from: 'Aganampudi',
      to: 'Cwc cfs',
      containerNo: '',
      size: '',
      amount: 9500
    }
  ];
  state.enableWeighment = true;
  state.weighmentCharges = 200;
  state.showStamp = true;
  state.showBankDetails = true;

  syncFormFromState();
  renderItemsEditor();
  updateCalculationsAndPrintPaper();
}

function loadSampleShirdi() {
  state.billType = 'container';
  state.customer = {
    name: 'M/S SHIRDI SAI SHIPPING PRIVATE LIMITED',
    address: 'Door No. 22-1-52, Kotha Agraharam Veedhi,\nChangalaraopeta,Visakhapatnam,\nAndhra Pradesh - 530001.',
    gst: '37AAUCS9164Q1ZZ'
  };
  state.billNo = '13/SSSPL-SSVLT/(2026-2027)';
  state.billDate = getTodayISODate();
  state.subject = 'Submission of bills (Export 01X20\')';
  state.items = [
    {
      date: getTodayISODate(),
      vehicleNo: 'AP31TB8466',
      from: 'SRAVAN 2',
      to: 'DUVVADA',
      containerNo: 'MEDU 6967921',
      size: "20'",
      amount: 8000
    }
  ];
  state.enableWeighment = false;
  state.weighmentCharges = '';
  state.showStamp = true;
  state.showBankDetails = true;

  syncFormFromState();
  renderItemsEditor();
  updateCalculationsAndPrintPaper();
}

function resetNewInvoice() {
  state.billType = 'standard';
  state.customer = { name: '', address: '', gst: '' };
  state.billNo = '';
  state.billDate = getTodayISODate();
  state.subject = '';
  state.items = [
    {
      date: getTodayISODate(),
      vehicleNo: '',
      from: '',
      to: '',
      containerNo: '',
      size: "20'",
      amount: ''
    }
  ];
  state.enableWeighment = false;
  state.weighmentCharges = '';
  state.showStamp = true;
  state.showBankDetails = true;

  syncFormFromState();
  renderItemsEditor();
  updateCalculationsAndPrintPaper();
}

// =============================================================================
// UTILS
// =============================================================================
function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', init);
