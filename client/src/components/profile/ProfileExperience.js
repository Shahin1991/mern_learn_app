import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";

const ProfileExperience = ({
  experience: { company, title, location, current, from, to, description }
}) => {
  return (
    <Fragment>
      <div>
        {company && <h3 class="text-dark">{company}</h3>}
        {from && (
          <p>
            <Moment format="MM/YYYY">{from}</Moment> -{" "}
            {current ? "Now" : <Moment format="MM/YYYY">{to}</Moment>}
          </p>
        )}
        {title && (
          <p>
            <strong>Position: </strong>
            {title}
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

ProfileExperience.propTypes = {
  experience: PropTypes.object.isRequired
};

export default ProfileExperience;
