"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

export default function AdminMealHistory() {
  const [users, setUsers] = useState([]);
  const [tiffins, setTiffins] = useState([]);
  const [meals, setMeals] = useState([]);
  const [nextMeal, setNextMeal] = useState(null);
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedTiffin, setSelectedTiffin] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mealType, setMealType] = useState("all");
  const [error, setError] = useState("");
  const [mealStats, setMealStats] = useState({ accepted: 0, rejected: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tiffinsRes] = await Promise.all([
          axios.get("/api/admin/users", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/api/admin/tiffins", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setUsers(usersRes.data);
        setTiffins(tiffinsRes.data);
        if (tiffinsRes.data.length > 0)
          setSelectedTiffin(tiffinsRes.data[0].id);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login?error=Session expired, please log in again");
        } else {
          setError(err.response?.data?.error || "Failed to fetch data");
        }
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    const fetchMealsAndStats = async () => {
      if (!selectedTiffin) return;
      try {
        const [mealsRes, statsRes, nextMealRes] = await Promise.all([
          axios.get(
            `/api/admin/meal-history?userId=${selectedUser}&tiffinId=${selectedTiffin}&mealType=${mealType}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(
            `/api/admin/meal-stats?tiffinId=${selectedTiffin}&mealType=${mealType}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          axios.get(`/api/admin/next-meal?tiffinId=${selectedTiffin}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setMeals(mealsRes.data);
        setMealStats(statsRes.data);
        setNextMeal(nextMealRes.data);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login?error=Session expired, please log in again");
        } else {
          setError(err.response?.data?.error || "Failed to fetch meal history");
        }
      }
    };
    fetchMealsAndStats();
  }, [selectedUser, selectedTiffin, mealType, router]);

  const filteredMeals = meals.filter((meal) =>
    filterStatus === "all" ? true : meal.status === filterStatus
  );

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">User Meal History</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Next Scheduled Meal
          </h2>
          {nextMeal ? (
            <div className="text-white">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(nextMeal.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Meal Type:</strong>{" "}
                {nextMeal.mealType.charAt(0).toUpperCase() +
                  nextMeal.mealType.slice(1)}
              </p>
              <p>
                <strong>Sabjis:</strong> {nextMeal.sabjis || "N/A"}
              </p>
              <p>
                <strong>Roti:</strong> {nextMeal.roti || "N/A"}
              </p>
              <p>
                <strong>Chawal:</strong> {nextMeal.chawal || "N/A"}
              </p>
              <p>
                <strong>Sweet:</strong> {nextMeal.sweet || "None"}
              </p>
            </div>
          ) : (
            <p className="text-white">No upcoming meal scheduled</p>
          )}
        </CardContent>
      </Card>
      <Card className="bg-slate-900/40 border border-blue-500/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Meal Statistics
          </h2>
          <p className="text-white">Total Accepted: {mealStats.accepted}</p>
          <p className="text-white">Total Rejected: {mealStats.rejected}</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-4">
            <div>
              <label className="text-blue-300 mr-2">Select User:</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[200px] bg-slate-800 text-white border-blue-500/30">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-blue-300 mr-2">Select Tiffin:</label>
              <Select value={selectedTiffin} onValueChange={setSelectedTiffin}>
                <SelectTrigger className="w-[200px] bg-slate-800 text-white border-blue-500/30">
                  <SelectValue placeholder="Select tiffin" />
                </SelectTrigger>
                <SelectContent>
                  {tiffins.map((tiffin) => (
                    <SelectItem key={tiffin.id} value={tiffin.id}>
                      {tiffin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-blue-300 mr-2">Filter by Status:</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-slate-800 text-white border-blue-500/30">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-blue-300 mr-2">Filter by Meal Type:</label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="w-[180px] bg-slate-800 text-white border-blue-500/30">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-blue-300">User</TableHead>
                <TableHead className="text-blue-300">Date</TableHead>
                <TableHead className="text-blue-300">Meal Type</TableHead>
                <TableHead className="text-blue-300">Sabjis</TableHead>
                <TableHead className="text-blue-300">Roti</TableHead>
                <TableHead className="text-blue-300">Chawal</TableHead>
                <TableHead className="text-blue-300">Sweet</TableHead>
                <TableHead className="text-blue-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeals.length > 0 ? (
                filteredMeals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell>{meal.user?.name || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(meal.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {meal.mealType.charAt(0).toUpperCase() +
                        meal.mealType.slice(1)}
                    </TableCell>
                    <TableCell>{meal.sabjis || "N/A"}</TableCell>
                    <TableCell>{meal.roti || "N/A"}</TableCell>
                    <TableCell>{meal.chawal || "N/A"}</TableCell>
                    <TableCell>{meal.sweet || "None"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          meal.status === "accepted"
                            ? "text-green-400"
                            : meal.status === "rejected"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }
                      >
                        {meal.status.charAt(0).toUpperCase() +
                          meal.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-white">
                    No meals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              router.push("/login");
            }}
            className="mt-4 bg-gray-500 text-white"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
