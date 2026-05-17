"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Home() {

  const [data, setData] = useState([
    {
      tanggal: "",
      deskripsi: "",
      masuk: "",
      pulang: "",
      durasi: 0,
      status: "Done",
    },
  ]);

  const tambahRow = () => {

    setData([
      ...data,
      {
        tanggal: "",
        deskripsi: "",
        masuk: "",
        pulang: "",
        durasi: 0,
        status: "Done",
      },
    ]);

  };

  const hapusRow = (index: number) => {

    const newData = data.filter(
      (_, i) => i !== index
    );

    setData(newData);

  };

  const hitungDurasi = (
    masuk: string,
    pulang: string
  ) => {

    if (!masuk || !pulang) return 0;

    const jamMasuk = parseInt(
      masuk.split(":")[0]
    );

    const jamPulang = parseInt(
      pulang.split(":")[0]
    );

    return jamPulang - jamMasuk;

  };

  const updateData = (
    index: number,
    field: string,
    value: string
  ) => {

    const newData = [...data];

    newData[index] = {
      ...newData[index],
      [field]: value,
    };

    if (
      field === "masuk" ||
      field === "pulang"
    ) {

      newData[index].durasi =
        hitungDurasi(
          field === "masuk"
            ? value
            : newData[index].masuk,

          field === "pulang"
            ? value
            : newData[index].pulang
        );

    }

    setData(newData);

  };

  const totalJam = data.reduce(
    (total, item) =>
      total + item.durasi,
    0
  );

  const simpanData = async () => {

    try {

      for (const item of data) {

        await addDoc(
          collection(db, "lembur"),
          {
            ...item,
            createdAt: new Date(),
          }
        );

      }

      alert(
        "Data berhasil disimpan ke Firebase!"
      );

    } catch (error) {

      console.error(error);

      alert("Gagal simpan data");

    }

  };

  const exportExcel = () => {

    const worksheetData = data.map(
      (item, index) => ({
        No: index + 1,
        Tanggal: item.tanggal,
        Deskripsi: item.deskripsi,
        JamMasuk: item.masuk,
        JamPulang: item.pulang,
        Durasi: item.durasi,
        Status: item.status,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(
        worksheetData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Lembur"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

    const fileData = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(
      fileData,
      "Timesheet_Lembur.xlsx"
    );

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-6">

      <div className="bg-white/80 backdrop-blur-lg border border-white/40 p-8 rounded-3xl shadow-2xl animate-fadeIn">

        <h1 className="text-4xl font-extrabold text-blue-700 mb-8 tracking-tight">
          Timesheet Lembur Karyawan
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-8">

          <div>
            <label className="font-semibold">
              Nama
            </label>

            <input
              type="text"
              defaultValue="Muhiddin"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            />
          </div>

          <div>
            <label className="font-semibold">
              Jabatan
            </label>

            <input
              type="text"
              defaultValue="OS1"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            />
          </div>

          <div>
            <label className="font-semibold">
              Divisi
            </label>

            <input
              type="text"
              defaultValue="Service Quality Assurance"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            />
          </div>

          <div>
            <label className="font-semibold">
              Bulan / Tahun
            </label>

            <input
              type="text"
              defaultValue="Mei 2026"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            />
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full overflow-hidden rounded-2xl border border-gray-200 shadow-lg">

            <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">

              <tr>
                <th className="border p-2">
                  No
                </th>

                <th className="border p-2">
                  Tanggal
                </th>

                <th className="border p-2">
                  Deskripsi Kerjaan
                </th>

                <th className="border p-2">
                  Jam Masuk
                </th>

                <th className="border p-2">
                  Jam Pulang
                </th>

                <th className="border p-2">
                  Durasi
                </th>

                <th className="border p-2">
                  Status
                </th>

                <th className="border p-2">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {data.map((item, index) => (

                <tr key={index}
  className="hover:bg-blue-50 transition-all duration-200"
>

                  <td className="border p-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border p-2">

                    <input
                      type="date"
                      value={item.tanggal}
                      onChange={(e) =>
                        updateData(
                          index,
                          "tanggal",
                          e.target.value
                        )
                      }
                      className="w-full outline-none bg-transparent px-2 py-1"
                    />

                  </td>

                  <td className="border p-2">

                    <input
                      type="text"
                      value={item.deskripsi}
                      onChange={(e) =>
                        updateData(
                          index,
                          "deskripsi",
                          e.target.value
                        )
                      }
                      className="w-full outline-none"
                    />

                  </td>

                  <td className="border p-2">

                    <input
                      type="text"
                      placeholder="18:00"
                      value={item.masuk}
                      onChange={(e) =>
                        updateData(
                          index,
                          "masuk",
                          e.target.value
                        )
                      }
                      className="w-full outline-none"
                    />

                  </td>

                  <td className="border p-2">

                    <input
                      type="text"
                      placeholder="22:00"
                      value={item.pulang}
                      onChange={(e) =>
                        updateData(
                          index,
                          "pulang",
                          e.target.value
                        )
                      }
                      className="w-full outline-none"
                    />

                  </td>

                  <td className="border p-2 text-center">
                    {item.durasi}
                  </td>

                  <td className="border p-2 text-center text-green-600 font-bold">
                    {item.status}
                  </td>

                  <td className="border p-2 text-center">

                    <button
                      onClick={() =>
                        hapusRow(index)
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded-lg transition-all duration-200 hover:scale-110 hover:-translate-y-1 active:scale-95 hover:shadow-xl cursor-pointer"
                    >
                      Hapus
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="mt-6 flex gap-4">

          <button
            onClick={tambahRow}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-2xl cursor-pointer"
          >
            + Tambah Row
          </button>

          <button
            onClick={simpanData}
            className="bg-green-600 text-white px-5 py-3 rounded-xl transition-all duration-200 hover:scale-110 hover:-translate-y-1 active:scale-95 hover:shadow-2xl cursor-pointer"
          >
            Simpan Firebase
          </button>

          <button
            onClick={exportExcel}
            className="bg-yellow-500 text-white px-5 py-3 rounded-xl transition-all duration-200 hover:scale-110 hover:-translate-y-1 active:scale-95 hover:shadow-2xl cursor-pointer"
          >
            Export Excel
          </button>

        </div>

        <div className="mt-6 flex justify-end">

          <div className="bg-blue-600 text-white px-5 py-3 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-2xl shadow-lg hover:shadow-blue-400/50 cursor-pointer">
            Total Jam : {totalJam}
          </div>

        </div>

      </div>

    </div>

  );

}