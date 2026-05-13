"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import Link from "next/link"

type Reservation = {
  id: number
  date: string
  time: string
  people: number
  name: string
  seat: string
  phone: string
}

export default function ReservationListPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>({})
  useEffect(() => {
    fetchReservations()
  }, [])

  const getToday = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const addOneDay = (dateString: string) => {
    const date = new Date(dateString)
    date.setDate(date.getDate() + 1)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const formatFileDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    return `${year.slice(2)}${month}${day}`
  }

  const fetchReservations = async () => {
    const today = getToday()

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    setReservations(data || [])
  }

  const deleteReservation = async (id: number) => {
  const isConfirm = confirm("예약을 삭제할까요?")

  if (!isConfirm) return

  const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id)

  if (error) {
      console.log(error)
      alert("삭제 실패")
      return
  }

  fetchReservations()
  }

  const updateReservation = async (id: number) => {
    const { error } = await supabase
      .from("reservations")
      .update({
        date: editData.date,
        time: editData.time,
        people: Number(editData.people),
        name: editData.name,
        seat: editData.seat,
        phone: editData.phone,
      })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("수정 실패")
      return
    }

    setEditingId(null)

    fetchReservations()
  }

  const downloadPhoneTxt = async () => {
    const today = getToday()

    const lastSavedDate = localStorage.getItem("last_phone_saved_date")
    const startDate = lastSavedDate ? addOneDay(lastSavedDate) : "2026-05-13"

    const { data, error } = await supabase
      .from("reservations")
      .select("date, phone")
      .gte("date", startDate)
      .lte("date", today)
      .order("date", { ascending: true })

    if (error) {
      console.log(error)
      alert("전화번호 저장 실패")
      return
    }

    const phones = (data || [])
      .map((reservation) => reservation.phone)
      .filter((phone) => phone && phone.trim() !== "")
      .join("\n")

    if (!phones) {
      alert("저장할 전화번호가 없습니다")
      return
    }

    const fileName = `${formatFileDate(startDate)}-${formatFileDate(today)}.txt`

    const blob = new Blob([phones], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()

    URL.revokeObjectURL(url)

    localStorage.setItem("last_phone_saved_date", today)

    alert(`${fileName} 저장 완료`)
  }

  return (
    <main className="min-h-screen bg-white p-5 text-black">
      <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link
            href="/"
            className="rounded-2xl border border-black px-5 py-3 text-lg font-bold"
            >
            ←
            </Link>

            <h1 className="text-4xl font-bold">
            예약 목록
            </h1>
        </div>

        <button
            onClick={downloadPhoneTxt}
            className="rounded-2xl border border-black bg-black px-5 py-3 text-lg font-bold text-white"
        >
            전화번호 저장
        </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-black/10">
          <div className="grid grid-cols-7 bg-stone-100 px-6 py-5 text-2xl font-bold">
            <div>날짜</div>
            <div>시간</div>
            <div>인원</div>
            <div>성함</div>
            <div>좌석</div>
            <div>전화번호</div>
            <div>관리</div>
          </div>

          {reservations.map((reservation) =>
            editingId === reservation.id ? (
              <div
                key={reservation.id}
                className="grid grid-cols-7 gap-2 border-t border-black/10 px-4 py-4"
              >
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                  className="rounded-lg border p-2"
                />

                <input
                  type="time"
                  value={editData.time}
                  onChange={(e) =>
                    setEditData({ ...editData, time: e.target.value })
                  }
                  className="rounded-lg border p-2"
                />

                <input
                  value={editData.people}
                  onChange={(e) =>
                    setEditData({ ...editData, people: e.target.value })
                  }
                  className="rounded-lg border p-2"
                />

                <input
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="rounded-lg border p-2"
                />

                <input
                  value={editData.seat}
                  onChange={(e) =>
                    setEditData({ ...editData, seat: e.target.value })
                  }
                  className="rounded-lg border p-2"
                />

                <input
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="rounded-lg border p-2"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-xl border px-3 py-2"
                  >
                    취소
                  </button>

                  <button
                    onClick={() => updateReservation(reservation.id)}
                    className="rounded-xl bg-black px-3 py-2 text-white"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={reservation.id}
                className="grid grid-cols-7 border-t border-black/10 px-6 py-5 text-2xl"
              >
                <div>{reservation.date}</div>
                <div>{reservation.time.slice(0, 5)}</div>
                <div>{reservation.people}명</div>
                <div>{reservation.name}</div>
                <div>{reservation.seat}</div>
                <div>{reservation.phone}</div>

                <div className="flex gap-2">
                  <button
                    onClick={() => deleteReservation(reservation.id)}
                    className="rounded-xl border border-red-500 px-3 py-2 text-base font-bold text-red-500"
                  >
                    삭제
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(reservation.id)

                      setEditData({
                        date: reservation.date,
                        time: reservation.time.slice(0, 5),
                        people: reservation.people,
                        name: reservation.name,
                        seat: reservation.seat,
                        phone: reservation.phone,
                      })
                    }}
                    className="rounded-xl border border-black px-3 py-2 text-base font-bold text-black"
                  >
                    변경
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  )
}