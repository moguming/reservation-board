"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

import Link from "next/link"

const getToday = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function NewReservationPage() {
  const [date, setDate] = useState(getToday())
  const [rawText, setRawText] = useState("")

  const [time, setTime] = useState("")
  const [people, setPeople] = useState("")
  const [name, setName] = useState("")
  const [seat, setSeat] = useState("홀")
  const [phone, setPhone] = useState("")
  const [memo, setMemo] = useState("")

  const parseReservation = () => {
    let text = rawText.trim()

    const seatValue = text.includes("룸") ? "룸" : "홀"
    setSeat(seatValue)
    text = text.replace("룸", "").replace("홀", "")

    const timeMatch =
      text.match(/(\d{1,2})시(\d{2})/) ||
      text.match(/(\d{1,2})\s*:\s*(\d{2})/) ||
      text.match(/(\d{1,2})시/)

    if (timeMatch) {
      let hour = Number(timeMatch[1])
      let minute = timeMatch[2] || "00"

      if (hour >= 1 && hour <= 11) {
        hour += 12
      }

      if (hour === 24) {
        hour = 12
      }

      setTime(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      )

      text = text.replace(timeMatch[0], "")
    }

    const peopleMatch = text.match(/\b(\d{1,2})\b/)

    if (peopleMatch) {
      const peopleValue = Number(peopleMatch[1])

      if (peopleValue >= 1 && peopleValue <= 99) {
        setPeople(String(peopleValue))
        text = text.replace(peopleMatch[0], "")
      }
    }

    const phoneMatch = text.match(/\d{8,11}/)
    if (phoneMatch) {
      let phoneValue = phoneMatch[0]

      if (phoneValue.length === 8) {
        phoneValue = `010${phoneValue}`
      }

      setPhone(phoneValue)
      text = text.replace(phoneMatch[0], "")
    }

    const cleaned = text
    .replace("오전", "")
    .replace("오후", "")
    .trim()

    const words = cleaned
    .split(/\s+/)
    .filter(Boolean)

    if (words.length >= 1) {
    setName(words[0])
    }

    if (words.length >= 2) {
    setMemo(words.slice(1).join(" "))
    }
    }

  const saveReservation = async () => {
    if (!date || !time || !people || !name) {
      alert("날짜, 시간, 인원, 성함은 꼭 필요해")
      return
    }

    const { error } = await supabase.from("reservations").insert({
      date,
      time,
      people: Number(people),
      name,
      seat,
      phone,
      memo,
    })

    if (error) {
      console.log(error)
      alert("저장 실패")
      return
    }

    alert("예약 저장 완료")

    setRawText("")
    setTime("")
    setPeople("")
    setName("")
    setSeat("홀")
    setPhone("")
    setMemo("")
  }

  return (
    <main className="min-h-screen bg-white p-5 text-black">
      <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <Link
            href="/"
            className="rounded-2xl border border-black px-2 py-1 text-lg font-bold"
          >
            ←
          </Link>

          <h1 className="text-3xl font-bold">
            예약 추가
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border p-4 text-xl"
          />

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="예: 6시 4명 김민수 룸 99999999 생일"
            className="min-h-32 rounded-xl border p-4 text-xl"
          />

          <button
            onClick={parseReservation}
            className="rounded-xl border border-black bg-stone-100 p-4 text-xl font-bold"
          >
            자동 구분
          </button>

          <div className="rounded-2xl border border-black/10 p-4">
            <div className="mb-3 text-lg font-bold">확인 / 수정</div>

            <div className="flex flex-col gap-3">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl border p-4"
                placeholder="시간"
              />

              <input
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="rounded-xl border p-4"
                placeholder="인원"
              />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border p-4"
                placeholder="성함"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSeat("홀")}
                  className={`rounded-xl border p-4 font-bold ${
                    seat === "홀" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  홀
                </button>

                <button
                  onClick={() => setSeat("룸")}
                  className={`rounded-xl border p-4 font-bold ${
                    seat === "룸" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  룸
                </button>
              </div>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border p-4"
                placeholder="전화번호"
              />

              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="rounded-xl border p-4"
                placeholder="메모"
              />
            </div>
          </div>

          <button
            onClick={saveReservation}
            className="rounded-xl bg-black p-4 text-xl font-bold text-white"
          >
            예약 저장
          </button>
        </div>
      </div>
    </main>
  )
}