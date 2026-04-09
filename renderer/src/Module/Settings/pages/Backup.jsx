import { useEffect, useState } from "react";
import {
  backupDatabase,
  getBackups,
  openBackupFolder,
  selectBackupFolder,
  setBackupPath,
  getBackupPath,
} from "../Services/settingService";
import toast from "react-hot-toast";

const FolderIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M2 4a1 1 0 011-1h3l2 2h5a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
  </svg>
);

const DownloadIcon = ({ className = "" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <path d="M8 1v8M5 6l3 3 3-3" />
    <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
  </svg>
);

const ExternalIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M10 3h3v3M13 3l-6 6M6 4H3v9h9v-3" />
  </svg>
);

const TableIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="2" y="2" width="12" height="12" rx="1" />
    <path d="M2 6h12M6 2v12" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M14 8A6 6 0 112 8" />
    <path d="M14 4v4h-4" />
  </svg>
);

const CardHeader = ({
  icon,
  title,
  iconBg = "bg-white",
  iconColor = "text-orange-100",
}) => (
  <div className="flex items-center gap-2.5 mb-3.5">
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor} shadow-sm border`}
    >
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-800 m-0">{title}</p>
  </div>
);
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}
  >
    {children}
  </div>
);

const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupPath, setBackupPathState] = useState("");

  const loadBackups = async () => {
    try {
      const data = await getBackups();
      setBackups(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load backups");
    }
  };

  const loadBackupPath = async () => {
    try {
      const path = await getBackupPath();
      if (path) setBackupPathState(path);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBackupPath();
    loadBackups();
  }, []);

  const handleBackup = async () => {
    try {
      setLoading(true);
      const res = await backupDatabase();
      if (res?.success) {
        toast.success(`Backup saved at: ${res.path}`);
        loadBackups();
      } else {
        toast.error(`Backup failed: ${res?.error || ""}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openBackupFolder();
    } catch (err) {
      console.error(err);
      toast.error("Failed to open folder");
    }
  };

  const handleSelectFolder = async () => {
    try {
      const folder = await selectBackupFolder();
      if (!folder) return;
      await setBackupPath(folder);
      setBackupPathState(folder);
      loadBackups();
      toast.success("Backup folder updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to select folder");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-lg font-medium text-gray-800 m-0">
            Backup settings
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-0">
            Manage database backups and restore points
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            autoBackup
              ? "bg-green-50 text-green-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${autoBackup ? "bg-green-600" : "bg-gray-400"}`}
          />
          {autoBackup ? "Auto backup on" : "Auto backup off"}
        </div>
      </div>

      {/* Top row — Auto + Manual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Auto backup */}
        <Card>
          <CardHeader icon={<RefreshIcon />} title="Auto backup" />
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={autoBackup}
              onClick={() => setAutoBackup(!autoBackup)}
              className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                autoBackup ? "bg-green-700" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all duration-200 ${
                  autoBackup ? "left-[18px]" : "left-[3px]"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              {autoBackup ? "Enabled — every 6 hours" : "Disabled"}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-2.5 mb-0">
            Runs silently in the background while the app is open.
          </p>
        </Card>

        {/* Manual backup */}
        <Card>
          <CardHeader icon={<DownloadIcon />} title="Manual backup" />
          <button
            onClick={handleBackup}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-opacity ${
              loading
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                : "bg-green-50 border-green-300 text-green-800 hover:bg-green-100 cursor-pointer"
            }`}
          >
            <DownloadIcon
              className={loading ? "text-gray-400" : "text-green-700"}
            />
            {loading ? "Backing up..." : "Back up now"}
          </button>
          <p className="text-xs text-gray-400 mt-2.5 mb-0">
            Creates an immediate snapshot of the current database.
          </p>
        </Card>
      </div>

      {/* Backup folder */}
      <Card>
        <CardHeader
          icon={<FolderIcon />}
          title="Backup folder"
          iconBg="bg-white"
          iconColor="text-orange-100"
        />
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
          <span className="text-gray-400 flex-shrink-0">
            <FolderIcon />
          </span>
          <span className="text-xs text-gray-500 font-mono break-all">
            {backupPath || "Default system folder will be used"}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSelectFolder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <span className="text-blue-600 flex">
              <FolderIcon />
            </span>
            Select folder
          </button>
          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ExternalIcon />
            Open folder
          </button>
        </div>
      </Card>

      {/* Backup file list */}
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-orange-100 border  flex-shrink-0">
              <TableIcon />
            </div>
            <p className="text-sm font-medium text-gray-800 m-0">
              Backup files
            </p>
          </div>
          <span className="text-xs text-gray-400">
            {backups.length} {backups.length === 1 ? "file" : "files"}
          </span>
        </div>

        {backups.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No backups found. Run your first backup above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm border-collapse"
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: "50%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    { label: "File", align: "text-left" },
                    { label: "Size", align: "text-right" },
                    { label: "Date", align: "text-right" },
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      className={`${align} px-2 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {backups.map((file, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-gray-50 transition-colors ${
                      i < backups.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <td className="px-2 py-2.5 text-gray-800 font-mono text-xs truncate">
                      {file.name}
                    </td>
                    <td className="px-2 py-2.5 text-right text-gray-500 text-xs">
                      {file.size}
                    </td>
                    <td className="px-2 py-2.5 text-right text-gray-500 text-xs">
                      {file.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Backup;
