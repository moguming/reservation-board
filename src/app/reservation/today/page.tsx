"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Reservation = {
  id: number
  date: string
  time: string
  people: number
  name: string
  seat: string
}

export default function TodayPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [editingSeatId, setEditingSeatId] = useState<number | null>(null)

  useEffect(() => {
    fetchReservations()

    const interval = setInterval(() => {
      fetchReservations()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const rowClass =
    reservations.length >= 12
      ? "px-6 py-3 text-2xl"
      : reservations.length >= 8
      ? "px-6 py-4 text-3xl"
      : "px-8 py-7 text-4xl"

  const headerClass =
    reservations.length >= 12
      ? "px-6 py-3 text-2xl"
      : reservations.length >= 8
      ? "px-6 py-4 text-3xl"
      : "px-8 py-6 text-4xl"

  const titleClass =
    reservations.length >= 12
      ? "text-4xl"
      : reservations.length >= 8
      ? "text-5xl"
      : "text-6xl"

  const getToday = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const fetchReservations = async () => {
    const today = getToday()

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", today)
      .order("time", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    setReservations(data || [])
  }

  const formatDisplayTime = (time: string) => {
    const [hour, minute] = time.split(":")
    const displayHour = Number(hour) > 12 ? Number(hour) - 12 : Number(hour)

    return `${displayHour}:${minute}`
  }

  const hallSeats = Array.from({ length: 9 }, (_, i) => `홀${i + 1}`)
  const roomSeats = Array.from({ length: 12 }, (_, i) => `룸${i + 10}`)

  const getSeatOptions = (seat: string) => {
    if (seat?.startsWith("룸")) {
      return [...roomSeats, ...hallSeats]
    }

    return [...hallSeats, ...roomSeats]
  }
  const allSeats = [...hallSeats, ...roomSeats]

  const updateSeat = async (id: number, seat: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ seat })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("좌석 변경 실패")
      return
    }

    setEditingSeatId(null)
    fetchReservations()
  }

  const isSeatUsed = (
    currentReservationId: number,
    seat: string
  ) => {
    return reservations.some(
      (reservation) =>
        reservation.id !== currentReservationId &&
        reservation.seat === seat
    )
  }
  const todayText = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <main className="min-h-screen bg-white text-black"
      style={{
        backgroundImage: "url('/background.png')",
        fontFamily: "Paperlogy",
      }}
    >
      <div className="flex h-screen flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className={`${titleClass} font-bold`}>
            {todayText}
          </h1>

          <div className="flex flex-col gap-3">
            <Link
              href="/reservation/new"
              className="rounded-2xl border border-black bg-white/30 px-3 py-3 text-center text-15px font-bold text-black"
            >
              예약 추가
            </Link>

            <Link
              href="/reservation/list"
              className="rounded-2xl border border-black bg-white/30 px-3 py-3 text-center text-15px font-bold text-black"
            >
              목록 보기
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-3xl border border-white/30 bg-white/15 backdrop-blur-sm">
          <div className={`grid grid-cols-4 bg-stone-100 font-bold ${headerClass}`}>
            <div>시간</div>
            <div>인원</div>
            <div>성함</div>
            <div>좌석</div>
          </div>

          {reservations.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-4xl text-black/40">
              오늘 예약이 없습니다
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className={`grid grid-cols-4 border-t border-black/10 tabular-nums ${rowClass}`}
              >
                <div>{formatDisplayTime(reservation.time)}</div>
                <div>{reservation.people}명</div>
                <div>{reservation.name}님</div>
                <div>
                  {editingSeatId === reservation.id ? (
                    <select
                      value={reservation.seat || "홀1"}
                      onChange={(e) => updateSeat(reservation.id, e.target.value)}
                      onBlur={() => setEditingSeatId(null)}
                      autoFocus
                      className="rounded-xl border border-black bg-white px-3 py-2 text-black"
                    >
                      {getSeatOptions(reservation.seat).map((seat) => {
                        const used = isSeatUsed(reservation.id, seat)

                        return (
                          <option
                            key={seat}
                            value={seat}
                            disabled={used}
                          >
                            {used ? `${seat} (사용중)` : seat}
                          </option>
                        )
                      })}
                                          </select>
                  ) : (
                    <button
                      onClick={() => setEditingSeatId(reservation.id)}
                      className="text-left font-bold underline-offset-4 hover:underline"
                    >
                      {reservation.seat || "홀1"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}