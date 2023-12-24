import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { differenceInMinutes, differenceInHours, differenceInDays, format } from 'date-fns';
import { useGetCurrentUser } from "@/lib/react-query/queries";
import Profilephoto from "./Profilephoto";
import DateDisplay from "./DateDisplay";

type UserCardProps = {
  activity: Models.Document;
  GroupName : String
};

const GroupActivity = ({ activity, GroupName }: UserCardProps) => {

  const { data: currentUser } = useGetCurrentUser();
  const currentDate = new Date();
  const date = new Date(activity.Time);

  let timeDifference;

  const minutesDifference = differenceInMinutes(currentDate, date);
  const hoursDifference = differenceInHours(currentDate, date);
  const daysDifference = differenceInDays(currentDate, date);

  if (minutesDifference < 1) {
    timeDifference = 'Just now';
  } else if (minutesDifference < 60) {
    timeDifference = `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
  } else if (hoursDifference < 24) {
    timeDifference = `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
  } else if (daysDifference < 3) {
    timeDifference = format(date, 'MMM dd, h:mm a');
  } else if (daysDifference < 7) {
    timeDifference = `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
  } else {
    timeDifference = format(date, 'MMM dd, yyyy, h:mm a');
  }

  const isPaidByCurrentUser = activity.PaidBy.$id === currentUser?.$id;
  const isCurrentUserInvolved = activity.splitMember?.some((member: { $id: string }) => member.$id === 
  currentUser?.$id) || false;
  const splitCount = activity.splitMember?.length ?? 0;

  let amountMessage = '';

  if (isPaidByCurrentUser && isCurrentUserInvolved) {
    const individualAmount = parseFloat(activity.Amout) / splitCount;    
    const getback = parseFloat(activity.Amout) - individualAmount
    amountMessage = `You get back $${getback.toFixed(2)}`;
  } 
  else if (isPaidByCurrentUser && !isCurrentUserInvolved) {
    const individualAmount = parseFloat(activity.Amout)
    amountMessage = `You get back $${individualAmount.toFixed(2)}`;
  } 
   else if (!isPaidByCurrentUser && isCurrentUserInvolved) {
     const individualAmount = parseFloat(activity.Amout) / splitCount;
    amountMessage = `You owe $${individualAmount.toFixed(2)}`;
  }
  else {
    amountMessage = `Not involved`;
  }

  return (
    <>
     <div style={{ display: 'flex', alignItems: 'center' }} className="pb-2">
            <DateDisplay dateTimeString={activity.Time} />
            <span className="text-blue-500 text-lg font-bold pl-20">&ensp;&#8377;{activity.Amout}</span>
      </div>
      <p className="text-lg font-bold mb-1">{activity.Desc}</p>
      <p>
        Added by <span className={`font-semibold ${isPaidByCurrentUser ? 'text-green-500' : ''}`}>"{activity.PaidBy.UserName}"</span> in{' '}
        <span className="font-semibold">"{GroupName}"</span>
      </p>
     <p className={`${isPaidByCurrentUser ? 'text-green-500 font-semibold' : (!isPaidByCurrentUser 
      && isCurrentUserInvolved ? 'text-red font-semibold' : 'text-indigo-700 font-semibold')}`}>
  {amountMessage}
</p>
    </>    
  );
};

export default GroupActivity;