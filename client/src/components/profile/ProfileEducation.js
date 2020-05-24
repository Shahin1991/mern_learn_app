import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";

const ProfileEducation = ({
  education: { school, degree, fieldofstudy, from, to, current, description }
}) => {
  return (
    <Fragment>
      <div>
        {school && <h3 class="text-dark">{school}</h3>}
        {from && (
          <p>
            <Moment format="MM/YYYY">{from}</Moment> -{" "}
            {current ? "Now" : <Moment format="MM/YYYY">{to}</Moment>}
          </p>
        )}
        {degree && (
          <p>
            <strong>Degree: </strong>
            {degree}
          </p>
        )}
        {fieldofstudy && (
          <p>
            <strong>Field Of Study: </strong>
            {fieldofstudy}
          </p>
        )}
        {description && (
          <p>
            <strong>Description: </strong>
            {description}
          </p>
        )}
      </div>
    </Fragment>
  );
};

ProfileEducation.propTypes = {
  education: PropTypes.object.isRequired
};

export default ProfileEducation;
