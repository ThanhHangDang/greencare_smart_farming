import React from 'react';

export default function IdeaPage() {
    return (
        <div className="row min-vh-100 ml-5">
            <div className="col-11 back_ground rounded">
                <section>
                    <div className="container  py-5">
                        <div className="row d-flex justify-content-center">
                            <div className="col-md-12 col-lg-10 col-xl-8">
                                <div className="card">
                                    <div className="card-footer py-3 border-0" style={{ backgroundColor: '#f8f9fa' }}>
                                        <div className="d-flex flex-start w-100">
                                            <img className="rounded-circle shadow-1-strong me-3" src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(19).webp" alt="avatar" width={40} height={40} />
                                            <div className="form-outline w-100">
                                                <textarea className="form-control" id="textAreaExample" placeholder='Write your comment here' rows={4} style={{ background: '#fff' }} defaultValue={""} />
                                                {/* <label className="form-label" htmlFor="textAreaExample">Message</label> */}
                                            </div>
                                        </div>
                                        <div className="float-end mt-2 pt-1">
                                            <button type="button" className="btn btn-primary btn-sm">Post comment</button>
                                            <button type="button" className="btn btn-outline-primary btn-sm ml-1">Cancel</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card text-dark mt-2">
                                    <div className="card-body p-4">
                                        <h4 className="mb-0">Recent comments</h4>
                                        <p className="fw-light mb-4 pb-2">Latest Comments section by users</p>
                                        <div className="d-flex flex-start">
                                            <div>
                                                <h6 className="fw-bold mb-1">Maggie Marsh</h6>
                                                <div className="d-flex align-items-center mb-3">
                                                    <p className="mb-0">
                                                        March 07, 2021
                                                        <span className="badge bg-primary">Pending</span>
                                                    </p>
                                                    <a href="#!" className="link-muted"><i className="fas fa-pencil-alt ms-2" /></a>
                                                    <a href="#!" className="link-muted"><i className="fas fa-redo-alt ms-2" /></a>
                                                    <a href="#!" className="link-muted"><i className="fas fa-heart ms-2" /></a>
                                                </div>
                                                <p className="mb-0">
                                                    Lorem Ipsum is simply dummy text of the printing and typesetting
                                                    industry. Lorem Ipsum has been the industry's standard dummy text ever
                                                    since the 1500s, when an unknown printer took a galley of type and
                                                    scrambled it.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="my-0" />
                                    <div className="card-body p-4">
                                        <div className="d-flex flex-start">
                                            <div>
                                                <h6 className="fw-bold mb-1">Lara Stewart</h6>
                                                <div className="d-flex align-items-center mb-3">
                                                    <p className="mb-0">
                                                        March 15, 2021
                                                        <span className="badge bg-success">Approved</span>
                                                    </p>
                                                    <a href="#!" className="link-muted"><i className="fas fa-pencil-alt ms-2" /></a>
                                                    <a href="#!" className="text-success"><i className="fas fa-redo-alt ms-2" /></a>
                                                    <a href="#!" className="link-danger"><i className="fas fa-heart ms-2" /></a>
                                                </div>
                                                <p className="mb-0">
                                                    Contrary to popular belief, Lorem Ipsum is not simply random text. It
                                                    has roots in a piece of classical Latin literature from 45 BC, making it
                                                    over 2000 years old. Richard McClintock, a Latin professor at
                                                    Hampden-Sydney College in Virginia, looked up one of the more obscure
                                                    Latin words, consectetur, from a Lorem Ipsum passage, and going through
                                                    the cites.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="my-0" style={{ height: 1 }} />
                                    <div className="card-body p-4">
                                        <div className="d-flex flex-start">
                                            <div>
                                                <h6 className="fw-bold mb-1">Alexa Bennett</h6>
                                                <div className="d-flex align-items-center mb-3">
                                                    <p className="mb-0">
                                                        March 24, 2021
                                                        <span className="badge bg-danger">Rejected</span>
                                                    </p>
                                                    <a href="#!" className="link-muted"><i className="fas fa-pencil-alt ms-2" /></a>
                                                    <a href="#!" className="link-muted"><i className="fas fa-redo-alt ms-2" /></a>
                                                    <a href="#!" className="link-muted"><i className="fas fa-heart ms-2" /></a>
                                                </div>
                                                <p className="mb-0">
                                                    There are many variations of passages of Lorem Ipsum available, but the
                                                    majority have suffered alteration in some form, by injected humour, or
                                                    randomised words which don't look even slightly believable. If you are
                                                    going to use a passage of Lorem Ipsum, you need to be sure.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
