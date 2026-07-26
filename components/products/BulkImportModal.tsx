"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { bulkImportProductsAction } from "@/app/actions/products";

interface BulkImportModalProps {
  onClose: () => void;
}

export function BulkImportModal({ onClose }: BulkImportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = "Name,Unit,Selling Price,Cost Price,Starting Stock,Category\n";
    const example = "Sliced Bread,loaf,1200,800,50,Bakery\n";
    const blob = new Blob([headers + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledgr_products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        
        if (lines.length <= 1) {
          setError("File is empty or contains only headers.");
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        
        const rows = lines.slice(1).map((line, index) => {
          // Simple CSV parse handling basic commas (ignores quoted commas for this MVP)
          const values = line.split(",").map(v => v.trim());
          const row: any = { _originalRow: index + 2, _status: "valid", _error: "" };
          
          headers.forEach((h, i) => {
            const val = values[i];
            if (h.includes("name")) row.name = val;
            if (h.includes("unit")) row.unit = val;
            if (h.includes("selling")) row.sellingPrice = val;
            if (h.includes("cost")) row.costPrice = val;
            if (h.includes("stock")) row.startingStock = val;
            if (h.includes("category")) row.category = val;
          });

          // Validation
          if (!row.name) {
            row._status = "invalid";
            row._error = "Missing Name";
          }
          
          const sp = parseInt(row.sellingPrice, 10);
          if (isNaN(sp) || sp <= 0) {
            row._status = "invalid";
            row._error = "Invalid Selling Price";
          } else {
            row.sellingPrice = sp;
          }

          const stock = parseInt(row.startingStock, 10);
          if (isNaN(stock) || stock < 0) {
            row._status = "invalid";
            row._error = "Invalid Stock";
          } else {
            row.startingStock = stock;
          }

          if (row.costPrice) {
            const cp = parseInt(row.costPrice, 10);
            if (isNaN(cp) || cp < 0) {
              row._status = "invalid";
              row._error = "Invalid Cost Price";
            } else {
              row.costPrice = cp;
            }
          }

          return row;
        });

        setParsedRows(rows);
        setStep("preview");
        setError("");
      } catch (err) {
        setError("Failed to parse CSV file. Ensure it matches the template.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r._status === "valid");
    if (validRows.length === 0) {
      setError("No valid rows to import.");
      return;
    }

    setLoading(true);
    const res = await bulkImportProductsAction(validRows);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4">
      <div className="bg-background border border-border/50 sm:rounded-[1.25rem] rounded-t-[1.25rem] shadow-xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col max-h-[90dvh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <h2 className="text-[18px] font-semibold text-text-primary font-heading">Bulk Import Products</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-[13px] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-6">
              <div className="bg-surface/50 border border-border/40 rounded-xl p-5 text-center space-y-3">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-brand opacity-80" />
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Upload CSV File</h3>
                  <p className="text-[13px] text-text-muted mt-1 max-w-sm mx-auto">
                    Upload a CSV file containing your products. We'll show you a preview before saving.
                  </p>
                </div>
                
                <div className="pt-2">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 text-sm font-medium text-text-primary bg-surface border border-border rounded-full hover:bg-border/50 transition-colors shadow-sm"
                  >
                    Select CSV File
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-surface/30 rounded-lg">
                <div className="text-[13px]">
                  <span className="font-medium text-text-primary">Need a template?</span>
                  <p className="text-text-muted mt-0.5">Download our ready-to-use CSV file.</p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="px-4 py-1.5 text-xs font-medium text-brand hover:bg-brand/10 rounded-full transition-colors"
                >
                  Download Template
                </button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[13px]">
                <p className="text-text-muted">
                  Found <span className="font-medium text-text-primary">{parsedRows.length}</span> rows.
                  Valid: <span className="font-medium text-success">{parsedRows.filter(r => r._status === "valid").length}</span>, 
                  Skipped: <span className="font-medium text-danger">{parsedRows.filter(r => r._status === "invalid").length}</span>
                </p>
                <button 
                  onClick={() => setStep("upload")}
                  className="text-brand hover:underline font-medium"
                >
                  Upload different file
                </button>
              </div>

              <div className="border border-border/40 rounded-xl overflow-hidden overflow-x-auto max-h-[40vh]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface/50 border-b border-border/40 text-text-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-medium">Row</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Sell Price</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {parsedRows.map((row, i) => (
                      <tr key={i} className={row._status === "invalid" ? "bg-danger/5" : ""}>
                        <td className="px-4 py-2.5 text-text-muted">{row._originalRow}</td>
                        <td className="px-4 py-2.5">
                          {row._status === "valid" ? (
                            <span className="text-success font-medium">Valid</span>
                          ) : (
                            <span className="text-danger font-medium flex items-center gap-1" title={row._error}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Skipped
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-2.5 ${row._status === "invalid" && !row.name ? 'text-danger' : 'text-text-primary'}`}>
                          {row.name || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-text-primary">{row.sellingPrice || "—"}</td>
                        <td className="px-4 py-2.5 text-text-primary">{row.startingStock ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/40 shrink-0 flex justify-end gap-3 bg-background">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={step === "preview" ? handleImport : () => fileInputRef.current?.click()}
            disabled={loading || (step === "preview" && parsedRows.filter(r => r._status === "valid").length === 0)}
            className="flex items-center justify-center min-w-[120px] px-4 py-2.5 text-[13px] font-medium text-white rounded-full [background:var(--brand-gradient)] hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === "upload" ? (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </>
            ) : (
              "Import Valid Rows"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
