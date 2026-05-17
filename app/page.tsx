"use client";

import { useState } from "react";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import {
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  db,
  auth,
  provider,
} from "@/lib/firebase";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

export default function Home() {

  const [user, setUser] =
    useState<any>(null);

  const [data, setData] = useState([
    {
      tanggal: "",
      deskripsi: "",
      masuk: "",
      pulang: "",
      durasi: 0,
      status: "Pending",
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
        status: "Pending",
      },
    ]);

  };

  const hapusRow = (
    index: number
  ) => {

    const newData = data.filter(
      (_, i) => i !== index
    );

    setData(newData);

  };

  const hitungDurasi = (
    masuk: string,
    pulang: string
  ) => {

    if (!masuk || !pulang)
      return 0;

    const jamMasuk =
      parseInt(
        masuk.split(":")[0]
      );

    const jamPulang =
      parseInt(
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
          collection(
            db,
            "lembur"
          ),
          {
            ...item,
            createdAt:
              new Date(),

            createdBy:
              user?.displayName ||
              "Unknown",

            email:
              user?.email ||
              "Unknown",
          }
        );

      }

      alert(
        "Data berhasil disimpan!"
      );

    } catch (error) {

      console.log(error);

      alert(
        "Gagal simpan data"
      );

    }

  };

  const exportExcel = () => {

    const worksheetData =
      data.map(
        (item, index) => ({
          No: index + 1,
          Tanggal:
            item.tanggal,
          Deskripsi:
            item.deskripsi,
          JamMasuk:
            item.masuk,
          JamPulang:
            item.pulang,
          Durasi:
            item.durasi,
          Status:
            item.status,
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

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const fileData =
      new Blob(
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

  const loginGoogle =
    async () => {

      try {

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        setUser(
          result.user
        );

      } catch (error) {

        console.log(error);

      }

    };

  const logoutGoogle =
    async () => {

      await signOut(auth);

      setUser(null);

    };

  if (!user) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200">

        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">

          <h1 className="text-3xl font-bold text-blue-700 mb-4">
            Timesheet Lembur
          </h1>

          <p className="text-gray-500 mb-6">
            Silakan login menggunakan Google
          </p>

          <button
            onClick={loginGoogle}
            className="bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all cursor-pointer"
          >
            Login Google
          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-6">

      <div className="bg-white/80 backdrop-blur-lg border border-white/40 p-8 rounded-3xl shadow-2xl">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h1 className="text-4xl font-extrabold text-blue-700">
              Lembur Admin SQA Puma
            </h1>

            <p className="text-gray-500 mt-1">
              Selamat datang, {user.displayName}
            </p>

          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-lg">

            <img
              src={user.photoURL}
              alt="profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />

            <div>

              <p className="font-bold text-gray-800">
                {user.displayName}
              </p>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>

            </div>

            <button
              onClick={logoutGoogle}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all cursor-pointer"
            >
              Logout
            </button>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">

          <div>

            <label className="font-semibold">
              Nama
            </label>

            <input
              type="text"
              defaultValue={user.displayName}
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1"
            />

          </div>

          <div>

            <label className="font-semibold">
              Jabatan
            </label>

            <input
              type="text"
              defaultValue="OS1"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1"
            />

          </div>

          <div>

            <label className="font-semibold">
              Divisi
            </label>

            <input
              type="text"
              defaultValue="Service Quality Assurance"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1"
            />

          </div>

          <div>

            <label className="font-semibold">
              Bulan / Tahun
            </label>

            <input
              type="text"
              defaultValue="Mei 2026"
              className="w-full border border-gray-300 bg-white/70 p-3 rounded-xl mt-1"
            />

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse overflow-hidden rounded-2xl shadow-lg">

            <thead>

              <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">

                <th className="p-4">
                  No
                </th>

                <th className="p-4">
                  Tanggal
                </th>

                <th className="p-4">
                  Deskripsi Kerjaan
                </th>

                <th className="p-4">
                  Jam Masuk
                </th>

                <th className="p-4">
                  Jam Pulang
                </th>

                <th className="p-4">
                  Durasi
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {data.map((item, index) => (

                <tr
                  key={index}
                  className="bg-white/70 backdrop-blur-lg hover:bg-blue-50 transition-all"
                >

                  <td className="border p-3 text-center">
                    {index + 1}
                  </td>

                  <td className="border p-3">

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
                      className="w-full bg-transparent outline-none"
                    />

                  </td>

                  <td className="border p-3">

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
                      className="w-full bg-transparent outline-none"
                    />

                  </td>

                  <td className="border p-3">

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
                      className="w-full bg-transparent outline-none"
                    />

                  </td>

                  <td className="border p-3">

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
  className="w-full bg-transparent outline-none"
/>

                  </td>

                  <td className="border p-3 text-center">
                    {item.durasi}
                  </td>

                  <td className="border p-3 text-center">

                    <span className="text-yellow-500 font-bold">
                      {item.status}
                    </span>

                  </td>

                  <td className="border p-3 text-center">

                    <button
                      onClick={() =>
                        hapusRow(index)
                      }
                      className="bg-red-500 hover:scale-105 transition-all text-white px-4 py-2 rounded-xl cursor-pointer"
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
            className="bg-blue-600 hover:scale-105 transition-all text-white px-5 py-3 rounded-2xl shadow-lg cursor-pointer"
          >
            + Tambah Row
          </button>

          <button
            onClick={simpanData}
            className="bg-green-600 hover:scale-105 transition-all text-white px-5 py-3 rounded-2xl shadow-lg cursor-pointer"
          >
            Simpan Firebase
          </button>

          <button
            onClick={exportExcel}
            className="bg-yellow-500 hover:scale-105 transition-all text-white px-5 py-3 rounded-2xl shadow-lg cursor-pointer"
          >
            Export Excel
          </button>

        </div>

        <div className="mt-10 flex justify-end">

          <div className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-lg font-bold">

            Total Jam : {totalJam}

          </div>

        </div>

      </div>

    </div>

  );

}