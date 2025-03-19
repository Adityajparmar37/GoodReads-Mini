import { client, DATABASE } from "../config/index.js";
const groups = "groups";
const groupMembers = "group_members";

//group's queries
export const insertGroup = (groupData) =>
  client.db(DATABASE).collection(groups).insertOne(groupData);

export const findGroup = (query, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection("groups")
    .aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "userId",
          as: "ownerDetails",
        },
      },
      {
        $project: {
          _id: 0,
          groupName: 1,
          groupDescription: 1,
          groupId: 1,
          createdAt: 1,
          ownerFullName: {
            $concat: [
              { $arrayElemAt: ["$ownerDetails.firstName", 0] },
              " ",
              { $arrayElemAt: ["$ownerDetails.lastName", 0] },
            ],
          },
        },
      },
      {
        $sort: { createdAt: sortOrder },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ])
    .toArray();

export const findGroupById = (groupId) =>
  client.db(DATABASE).collection(groups).findOne(groupId);

export const deleteGroup = (groupId) =>
  client.db(DATABASE).collection(groups).deleteOne(groupId);

export const updateGroupById = (groupId, updateGroupData) =>
  client
    .db(DATABASE)
    .collection(groups)
    .updateOne({ groupId }, { $set: { ...updateGroupData } });

//member's queries
export const insertMember = (memberDetails) =>
  client.db(DATABASE).collection(groupMembers).insertOne(memberDetails);

export const findMemberById = (filter) =>
  client.db(DATABASE).collection(groupMembers).findOne(filter);

export const findMembers = (groupId, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(groupMembers)
    .aggregate([
      {
        $match: { groupId },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "memberId",
          as: "membersDetails",
        },
      },
      {
        $unwind: "$membersDetails",
      },
      {
        $project: {
          _id: 0,
          memberName: {
            $concat: [
              "$membersDetails.firstName",
              " ",
              "$membersDetails.lastName",
            ],
          },
          role: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: sortOrder },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ])
    .toArray();

export const deleteMembers = (filter) =>
  client.db(DATABASE).collection(groupMembers).deleteMany(filter);
