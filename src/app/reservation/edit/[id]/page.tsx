"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function EditReservationPage() {
  const params = useParams()
  const router = useRouter()

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [people, setPeople] = useState("")
  const [name, setName] = useState("")
  const [seat, setSeat] = useState("")
  const [phone, setPhone] = useState("")
  const [memo, setMemo] = useState("")

  useEffect(() => {
    fetchReservation()
  }, [])

  const fetchReservation = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.log(error)
      return
    }

    setDate(data.date)
    setTime(data.time.slice(0, 5))
    setPeople(String(data.people))
    setName(data.name)
    setSeat(data.seat || "")
    setPhone(data.phone || "")
    setMemo(data.memo || "")
  }

  const updateReservation = async () => {
    const { error } = await supabase
      .from("reservations")
      .update({
        date,
        time,
        people: Number(people),
        name,
        seat,
        phone,
        memo,
      })
      .eq("id", params.id)

    if (error) {
      console.log(error)
      alert("수정 실패")
      return
    }

    alert("수정 완료")

    router.push("/reservation/list")
  }

  return (
    <main className="min-h-screen bg-stone-100 p-5">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="mb-5 text-3xl font-bold">
          예약 수정
        </h1>

        <div className="flex flex-col gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border p-4" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl border p-4" />
          <input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="인원" className="rounded-xl border p-4" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="성함" className="rounded-xl border p-4" />
          <input value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="좌석" className="rounded-xl border p-4" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="전화번호" className="rounded-xl border p-4" />
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모" className="rounded-xl border p-4" />

          <button
            onClick={updateReservation}
            className="mt-3 rounded-xl bg-black p-4 text-xl font-bold text-white"
          >
            수정 저장
          </button>
        </div>
      </div>
    </main>
  )
}